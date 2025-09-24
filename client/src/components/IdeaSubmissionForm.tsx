import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { FormField as FormFieldType, FormFieldOption } from '@shared/schema';

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

  // Create dynamic schema based on form fields
  const formSchema = z.object(
    formFields.reduce((acc, field) => {
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
        default:
          validation = field.required === 'true'
            ? z.string().min(1, `${field.label} is required`)
            : z.string().optional();
      }
      
      acc[field.name] = validation;
      return acc;
    }, {} as Record<string, any>)
  );

  type FormData = z.infer<typeof formSchema>;

  // Create default values based on form fields
  const defaultValues = formFields.reduce((acc, field) => {
    acc[field.name] = '';
    return acc;
  }, {} as Record<string, any>);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Create idea mutation with dynamic field support
  const createIdeaMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Create main idea record with core fields
      const coreFields = ['submitter_name', 'idea_title', 'description', 'component', 'tag', 'type'];
      const ideaData = {
        name: data.submitter_name || '',
        title: data.idea_title || '',
        description: data.description || '',
        component: data.component || '',
        tag: data.tag || '',
        type: data.type || '',
      };
      
      console.log('Submitting idea data:', ideaData);
      console.log('Full form data:', data);
      
      // Create the main idea  
      const ideaResponse = await apiRequest('POST', '/api/ideas', ideaData);
      const idea = await ideaResponse.json();
      
      // Store dynamic field values for any additional fields
      const dynamicFields = Object.entries(data).filter(([key]) => !coreFields.includes(key));
      
      if (dynamicFields.length > 0) {
        console.log('Storing dynamic fields:', dynamicFields);
        for (const [fieldName, value] of dynamicFields) {
          if (value && value !== '') {
            const field = formFields.find(f => f.name === fieldName);
            if (field) {
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

  const onSubmit = async (data: FormData) => {
    createIdeaMutation.mutate(data);
  };

  // Render field based on type
  const renderField = (field: FormFieldType) => {
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
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={field.placeholder || ''}
                    className="min-h-[120px]"
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
            {/* Render form fields dynamically based on admin configuration */}
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