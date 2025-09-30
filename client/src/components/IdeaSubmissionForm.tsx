import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { FormField as FormFieldType, FormFieldOption, KanbanCategory } from '@shared/schema';

// Dynamic schema creation will be handled in the component

export default function IdeaSubmissionForm() {
  const { toast } = useToast();

  // Fetch form fields configured by admin
  const { data: formFields = [], isLoading: isLoadingFields } = useQuery<FormFieldType[]>({
    queryKey: ['/api/form-fields'],
    queryFn: async () => {
      const response = await fetch('/api/form-fields', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch form fields');
      return response.json();
    },
  });

  // Fetch field options for list fields
  const { data: allFieldOptions = [] } = useQuery<FormFieldOption[]>({
    queryKey: ['/api/form-field-options'],
    queryFn: async () => {
      const response = await fetch('/api/form-field-options', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch field options');
      return response.json();
    },
    enabled: formFields.some(field => field.type === 'list'),
  });

  // Fetch kanban categories for the type field
  const { data: kanbanCategories = [] } = useQuery<KanbanCategory[]>({
    queryKey: ['/api/kanban-categories'],
    queryFn: async () => {
      const response = await fetch('/api/kanban-categories', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch kanban categories');
      return response.json();
    },
  });

  // Create schema with system Category field + dynamic fields
  const createFormSchema = () => {
    const baseSchema = {
      // System field: Type/Category (always required)
      type: z.string().min(1, 'Category is required'),
    };
    
    // Add dynamic fields
    formFields.forEach((field) => {
      let validation: any;
      
      switch (field.type) {
        case 'number':
          validation = field.required === 'true' 
            ? z.number({ coerce: true })
            : z.number({ coerce: true }).optional();
          break;
        case 'email':
          validation = field.required === 'true'
            ? z.string().email('Please enter a valid email address').min(1, `${field.label} is required`)
            : z.string().email('Please enter a valid email address').optional();
          break;
        case 'textarea':
          validation = field.required === 'true'
            ? z.string().min(1, `${field.label} is required`).max(1000, `${field.label} must not exceed 1000 characters`)
            : z.string().max(1000, `${field.label} must not exceed 1000 characters`).optional();
          break;
        case 'list':
          // Handle multi-select fields
          if (field.allowMultiSelect === 'true') {
            validation = field.required === 'true'
              ? z.array(z.string()).min(1, `${field.label} is required`)
              : z.array(z.string()).optional();
          } else {
            validation = field.required === 'true'
              ? z.string().min(1, `${field.label} is required`)
              : z.string().optional();
          }
          break;
        default:
          validation = field.required === 'true'
            ? z.string().min(1, `${field.label} is required`)
            : z.string().optional();
      }
      
      (baseSchema as any)[field.name] = validation;
    });
    
    return z.object(baseSchema);
  };

  const formSchema = createFormSchema();

  type FormData = z.infer<typeof formSchema>;

  // Create default values with system Type field + dynamic fields
  const defaultValues = {
    // System field: Type/Category
    type: '',
    
    // Dynamic fields based on form configuration
    ...formFields.reduce((acc, field) => {
      // Multi-select fields default to empty array, others to empty string
      acc[field.name] = (field.type === 'list' && field.allowMultiSelect === 'true') ? [] : '';
      return acc;
    }, {} as Record<string, any>)
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Create idea mutation with system Category field + dynamic field support
  const createIdeaMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Only the type field is a true core field - all others are dynamic fields
      const coreFields = ['type'];
      
      // Map dynamic form fields to database schema fields for backward compatibility
      const getFieldValue = (fieldName: string) => {
        const field = formFields.find(f => f.name === fieldName);
        return field ? (data[fieldName] || '') : '';
      };
      
      const ideaData = {
        name: getFieldValue('submitter_name'),
        title: getFieldValue('idea_title'), 
        description: getFieldValue('description'),
        component: getFieldValue('component'),
        tag: getFieldValue('tag'),
        type: data.type || '', // System field
      };
      
      console.log('Submitting idea data:', ideaData);
      console.log('Full form data:', data);
      
      // Create the main idea  
      const ideaResponse = await apiRequest('POST', '/api/ideas', ideaData);
      const idea = await ideaResponse.json();
      
      // Store dynamic field values for any additional fields not mapped to database schema
      const schemaFields = ['type', 'submitter_name', 'idea_title', 'description', 'component', 'tag'];
      const dynamicFields = Object.entries(data).filter(([key]) => !schemaFields.includes(key));
      
      if (dynamicFields.length > 0) {
        console.log('Storing dynamic fields:', dynamicFields);
        for (const [fieldName, value] of dynamicFields) {
          const field = formFields.find(f => f.name === fieldName);
          if (field && value) {
            // Handle multi-select fields (array values)
            if (Array.isArray(value)) {
              // Create a separate row for each selected value
              for (const singleValue of value) {
                if (singleValue && singleValue !== '') {
                  await apiRequest('POST', '/api/idea-dynamic-fields', {
                    ideaId: idea.id,
                    fieldId: field.id,
                    value: String(singleValue)
                  });
                }
              }
            } else if (value !== '') {
              // Single value field
              await apiRequest('POST', '/api/idea-dynamic-fields', {
                ideaId: idea.id,
                fieldId: field.id,
                value: String(value)
              });
            }
          }
        }
      }
      
      return idea;
    },
    onSuccess: () => {
      // Invalidate ideas cache to refresh the Browse Ideas view
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
      // Invalidate statistics cache to refresh Analytics dashboard
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({
        title: "Idea submitted successfully!",
        description: "Thank you for contributing to the AI Summit.",
      });
      form.reset();
    },
    onError: (error: any) => {
      console.error('Error submitting idea:', error);
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Mutation for adding new field option
  const addFieldOptionMutation = useMutation({
    mutationFn: async (data: { fieldId: string; value: string; label: string; order: string }) => {
      return apiRequest('POST', '/api/form-field-options', data);
    },
    onSuccess: () => {
      // Invalidate field options to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/form-field-options'] });
    },
  });

  const onSubmit = async (data: FormData) => {
    createIdeaMutation.mutate(data);
  };

  // State for combobox fields
  const [fieldStates, setFieldStates] = useState<Record<string, { open: boolean; searchValue: string }>>({});

  const getFieldState = (fieldId: string) => fieldStates[fieldId] || { open: false, searchValue: '' };
  const setFieldState = (fieldId: string, state: { open?: boolean; searchValue?: string }) => {
    setFieldStates(prev => ({
      ...prev,
      [fieldId]: { ...getFieldState(fieldId), ...state }
    }));
  };

  // Render field based on type
  const renderField = (field: FormFieldType) => {
    // Get field options for list-type fields
    const fieldOptions = allFieldOptions.filter(option => 
      option.fieldId === field.id && option.isActive === 'true'
    );

    switch (field.type) {
      case 'textarea':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => {
              const currentValue = formField.value || '';
              const charCount = currentValue.length;
              const isOverLimit = charCount > 1000;
              
              return (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={field.placeholder || ''}
                      className={`min-h-[120px] ${isOverLimit ? 'border-destructive' : ''}`}
                      data-testid={`input-${field.name}`}
                      maxLength={1000}
                      {...formField} 
                    />
                  </FormControl>
                  <div className="flex items-center justify-between">
                    <div>
                      {field.helpText && (
                        <p className="text-sm text-muted-foreground">{field.helpText}</p>
                      )}
                    </div>
                    <p className={`text-sm ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {charCount}/1000 characters
                    </p>
                  </div>
                  <FormMessage />
                  {isOverLimit && (
                    <p className="text-sm text-destructive">
                      Character limit exceeded. Please reduce the text to 1000 characters or less.
                    </p>
                  )}
                </FormItem>
              );
            }}
          />
        );

      case 'number':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    placeholder={field.placeholder || ''}
                    data-testid={`input-${field.name}`}
                    {...formField}
                    onChange={(e) => formField.onChange(Number(e.target.value))}
                  />
                </FormControl>
                {field.helpText && (
                  <p className="text-sm text-muted-foreground">{field.helpText}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'email':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder={field.placeholder || ''}
                    data-testid={`input-${field.name}`}
                    {...formField} 
                  />
                </FormControl>
                {field.helpText && (
                  <p className="text-sm text-muted-foreground">{field.helpText}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'list':
        const allowUserAdditions = field.allowUserAdditions === 'true';
        const allowMultiSelect = field.allowMultiSelect === 'true';
        
        if (allowMultiSelect) {
          // Render Multi-Select Combobox
          return (
            <FormField
              key={field.id}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => {
                const { open, searchValue } = getFieldState(field.id);
                const selectedValues = Array.isArray(formField.value) ? formField.value : [];
                
                const handleSelect = (value: string) => {
                  const newValues = selectedValues.includes(value)
                    ? selectedValues.filter(v => v !== value)
                    : [...selectedValues, value];
                  formField.onChange(newValues);
                };
                
                const handleRemove = (value: string) => {
                  formField.onChange(selectedValues.filter(v => v !== value));
                };
                
                const handleCreateOption = () => {
                  if (allowUserAdditions && searchValue.trim() && !fieldOptions.some(opt => opt.value === searchValue.trim())) {
                    const nextOrder = Math.max(0, ...fieldOptions.map(opt => parseInt(opt.order || '0'))) + 1;
                    addFieldOptionMutation.mutate({
                      fieldId: field.id,
                      value: searchValue.trim(),
                      label: searchValue.trim(),
                      order: nextOrder.toString()
                    });
                    handleSelect(searchValue.trim());
                    setFieldState(field.id, { searchValue: '' });
                  }
                };

                return (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <Popover open={open} onOpenChange={(isOpen) => setFieldState(field.id, { open: isOpen })}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between min-h-10"
                            data-testid={`multiselect-${field.name}`}
                          >
                            <div className="flex flex-wrap gap-1 flex-1">
                              {selectedValues.length > 0 ? (
                                selectedValues.map((value) => {
                                  const option = fieldOptions.find(opt => opt.value === value);
                                  return (
                                    <Badge key={value} variant="secondary" className="text-xs">
                                      {option?.label || value}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemove(value);
                                        }}
                                        className="ml-1 hover:text-destructive"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </Badge>
                                  );
                                })
                              ) : (
                                <span className="text-muted-foreground">
                                  {field.placeholder || `Select ${field.label.toLowerCase()}`}
                                </span>
                              )}
                            </div>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput 
                            placeholder={allowUserAdditions ? `Search or add ${field.label.toLowerCase()}...` : `Search ${field.label.toLowerCase()}...`}
                            value={searchValue}
                            onValueChange={(value) => setFieldState(field.id, { searchValue: value })}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {allowUserAdditions && searchValue.trim() ? (
                                <div className="p-2">
                                  <Button
                                    size="sm"
                                    onClick={handleCreateOption}
                                    className="w-full"
                                    data-testid={`button-add-${field.name}`}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add "{searchValue.trim()}"
                                  </Button>
                                </div>
                              ) : (
                                `No ${field.label.toLowerCase()} found.`
                              )}
                            </CommandEmpty>
                            <CommandGroup>
                              {fieldOptions.map((option) => (
                                <CommandItem
                                  key={option.id}
                                  value={option.value}
                                  onSelect={() => handleSelect(option.value)}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      selectedValues.includes(option.value) ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  {option.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {field.helpText && (
                      <p className="text-sm text-muted-foreground">{field.helpText}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          );
        } else if (allowUserAdditions) {
          // Render Single-Select Combobox for fields that allow user additions
          return (
            <FormField
              key={field.id}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => {
                const { open, searchValue } = getFieldState(field.id);
                
                const handleCreateOption = () => {
                  if (searchValue.trim() && !fieldOptions.some(opt => opt.value === searchValue.trim())) {
                    const nextOrder = Math.max(0, ...fieldOptions.map(opt => parseInt(opt.order || '0'))) + 1;
                    addFieldOptionMutation.mutate({
                      fieldId: field.id,
                      value: searchValue.trim(),
                      label: searchValue.trim(),
                      order: nextOrder.toString()
                    });
                    formField.onChange(searchValue.trim());
                    setFieldState(field.id, { searchValue: '', open: false });
                  }
                };

                return (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <Popover open={open} onOpenChange={(isOpen) => setFieldState(field.id, { open: isOpen })}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                            data-testid={`combobox-${field.name}`}
                          >
                            {formField.value
                              ? fieldOptions.find((option) => option.value === formField.value)?.label || formField.value
                              : field.placeholder || `Select ${field.label.toLowerCase()}`}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput 
                            placeholder={`Search or add ${field.label.toLowerCase()}...`}
                            value={searchValue}
                            onValueChange={(value) => setFieldState(field.id, { searchValue: value })}
                          />
                          <CommandList>
                            <CommandEmpty>
                              {searchValue.trim() ? (
                                <div className="p-2">
                                  <Button
                                    size="sm"
                                    onClick={handleCreateOption}
                                    className="w-full"
                                    data-testid={`button-add-${field.name}`}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add "{searchValue.trim()}"
                                  </Button>
                                </div>
                              ) : (
                                `No ${field.label.toLowerCase()} found.`
                              )}
                            </CommandEmpty>
                            <CommandGroup>
                              {fieldOptions.map((option) => (
                                <CommandItem
                                  key={option.id}
                                  value={option.value}
                                  onSelect={(currentValue) => {
                                    formField.onChange(currentValue === formField.value ? "" : currentValue);
                                    setFieldState(field.id, { open: false, searchValue: '' });
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      formField.value === option.value ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  {option.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {field.helpText && (
                      <p className="text-sm text-muted-foreground">{field.helpText}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          );
        } else {
          // Render regular Select for fields that don't allow user additions
          return (
            <FormField
              key={field.id}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                    <FormControl>
                      <SelectTrigger data-testid={`select-${field.name}`}>
                        <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {fieldOptions.map((option) => (
                        <SelectItem key={option.id} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.helpText && (
                    <p className="text-sm text-muted-foreground">{field.helpText}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        }

      default: // text
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={field.placeholder || ''}
                    data-testid={`input-${field.name}`}
                    {...formField} 
                  />
                </FormControl>
                {field.helpText && (
                  <p className="text-sm text-muted-foreground">{field.helpText}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  // Don't render form until fields are loaded
  if (isLoadingFields || formFields.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          {isLoadingFields ? (
            <p>Loading form...</p>
          ) : (
            <p>No form fields configured. Please contact an administrator.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Lightbulb className="w-6 h-6 text-primary" />
          <CardTitle className="text-2xl">Submit Your AI Idea</CardTitle>
        </div>
        <CardDescription>
          Share your innovative AI solutions and ideas for the Product & Engineering Summit 2025
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* System Category Field - Always present */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => {
                const activeCategories = kanbanCategories.filter(cat => cat.isActive === 'true').sort((a, b) => parseInt(a.order) - parseInt(b.order));
                
                return (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activeCategories.map((category) => (
                          <SelectItem key={category.id} value={category.key}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: category.color }}
                              />
                              {category.title}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            
            {/* Render dynamic form fields based on admin configuration */}
            <div className="space-y-4">
              {formFields
                .filter(field => field.isActive === 'true')
                .sort((a, b) => Number(a.order) - Number(b.order))
                .map(field => renderField(field))
              }
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={createIdeaMutation.isPending}
              data-testid="button-submit"
            >
              <Plus className="w-4 h-4 mr-2" />
              {createIdeaMutation.isPending ? 'Submitting...' : 'Submit Idea'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}