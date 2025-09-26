import { db } from "./db";
import { ideas, kanbanCategories } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Data Migration Utility for Category Synchronization
 * 
 * This script helps fix data inconsistencies between ideas.type values
 * and kanban category keys that might occur from manual data changes
 * or importing data from external sources.
 */

interface MigrationResult {
  totalIdeas: number;
  inconsistentIdeas: number;
  fixedIdeas: number;
  errors: string[];
}

/**
 * Analyzes and optionally fixes ideas with invalid category types
 * @param fix - Whether to actually fix the data (default: false, just analyze)
 * @param defaultCategory - Category key to assign to orphaned ideas (default: first valid category)
 */
export async function migrateIdeaCategories(fix: boolean = false, defaultCategory?: string): Promise<MigrationResult> {
  console.log(`Starting category migration analysis (fix: ${fix})...`);
  
  const result: MigrationResult = {
    totalIdeas: 0,
    inconsistentIdeas: 0,
    fixedIdeas: 0,
    errors: []
  };

  try {
    // Get all valid kanban category keys
    const validCategories = await db.select({ key: kanbanCategories.key })
      .from(kanbanCategories)
      .where(eq(kanbanCategories.isActive, "true"));
    
    const validKeys = new Set(validCategories.map(cat => cat.key));
    console.log(`Found ${validKeys.size} valid category keys:`, Array.from(validKeys));

    if (validKeys.size === 0) {
      throw new Error("No active kanban categories found. Cannot proceed with migration.");
    }

    // Default to first category if not specified
    const fallbackCategory = defaultCategory || validCategories[0].key;
    if (!validKeys.has(fallbackCategory)) {
      throw new Error(`Default category '${fallbackCategory}' is not a valid active category.`);
    }

    // Get all ideas
    const allIdeas = await db.select({ id: ideas.id, type: ideas.type, title: ideas.title })
      .from(ideas);
    
    result.totalIdeas = allIdeas.length;
    console.log(`Analyzing ${result.totalIdeas} ideas...`);

    const inconsistentIdeas = allIdeas.filter(idea => !validKeys.has(idea.type));
    result.inconsistentIdeas = inconsistentIdeas.length;

    if (result.inconsistentIdeas === 0) {
      console.log("✅ All ideas have valid category types. No migration needed.");
      return result;
    }

    console.log(`⚠️  Found ${result.inconsistentIdeas} ideas with invalid category types:`);
    for (const idea of inconsistentIdeas) {
      console.log(`  - "${idea.title}" (ID: ${idea.id}) has type: "${idea.type}"`);
    }

    if (fix) {
      console.log(`🔧 Fixing inconsistent ideas by setting type to: "${fallbackCategory}"`);
      
      for (const idea of inconsistentIdeas) {
        try {
          await db.update(ideas)
            .set({ type: fallbackCategory })
            .where(eq(ideas.id, idea.id));
          
          result.fixedIdeas++;
          console.log(`  ✅ Fixed: "${idea.title}" (${idea.type} → ${fallbackCategory})`);
        } catch (error) {
          const errorMsg = `Failed to fix idea "${idea.title}" (${idea.id}): ${error}`;
          result.errors.push(errorMsg);
          console.error(`  ❌ ${errorMsg}`);
        }
      }
    } else {
      console.log(`🔍 Analysis complete. Run with fix=true to update ${result.inconsistentIdeas} ideas.`);
    }

  } catch (error) {
    const errorMsg = `Migration failed: ${error}`;
    result.errors.push(errorMsg);
    console.error(`❌ ${errorMsg}`);
  }

  return result;
}

/**
 * Validates that all form field options for the 'type' field match kanban categories
 */
export async function validateFormFieldSync(): Promise<{ isValid: boolean; issues: string[] }> {
  console.log("Validating form field options sync with kanban categories...");
  
  const issues: string[] = [];
  
  try {
    // Get kanban categories
    const kanbanCats = await db.select()
      .from(kanbanCategories)
      .where(eq(kanbanCategories.isActive, "true"));
    
    // Get type field options
    const typeFieldOptions = await db.execute(sql`
      SELECT ffo.value, ffo.label, ffo.is_active
      FROM form_field_options ffo
      JOIN form_fields ff ON ffo.field_id = ff.id
      WHERE ff.name = 'type'
      AND ffo.is_active = 'true'
    `);
    
    const kanbanKeys = new Set(kanbanCats.map(cat => cat.key));
    const formOptionValues = new Set(typeFieldOptions.rows.map(row => row.value));
    
    // Check for kanban categories missing from form options
    for (const kanbanCat of kanbanCats) {
      if (!formOptionValues.has(kanbanCat.key)) {
        issues.push(`Kanban category '${kanbanCat.key}' missing from form field options`);
      }
    }
    
    // Check for form options missing from kanban categories
    for (const row of typeFieldOptions.rows) {
      if (!kanbanKeys.has(row.value as string)) {
        issues.push(`Form field option '${row.value}' missing from kanban categories`);
      }
    }
    
    if (issues.length === 0) {
      console.log("✅ Form field options are synchronized with kanban categories");
    } else {
      console.log("⚠️  Found synchronization issues:");
      issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
  } catch (error) {
    issues.push(`Validation failed: ${error}`);
    console.error(`❌ ${issues[issues.length - 1]}`);
  }
  
  return { isValid: issues.length === 0, issues };
}

// CLI interface for running migrations manually
async function runCLI() {
  const args = process.argv.slice(2);
  const fix = args.includes('--fix');
  const defaultCategory = args.find(arg => arg.startsWith('--default='))?.split('=')[1];
  
  console.log("🚀 Starting data migration utility...");
  
  try {
    const migrationResult = await migrateIdeaCategories(fix, defaultCategory);
    
    console.log("\n📊 Migration Summary:");
    console.log(`  Total ideas: ${migrationResult.totalIdeas}`);
    console.log(`  Inconsistent ideas: ${migrationResult.inconsistentIdeas}`);
    console.log(`  Fixed ideas: ${migrationResult.fixedIdeas}`);
    console.log(`  Errors: ${migrationResult.errors.length}`);
    
    if (migrationResult.errors.length > 0) {
      console.log("\n❌ Errors:");
      migrationResult.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    const validation = await validateFormFieldSync();
    
    if (!validation.isValid) {
      console.log("\n⚠️  Sync validation issues found:");
      validation.issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    process.exit(validation.isValid && migrationResult.fixedIdeas >= 0 ? 0 : 1);
  } catch (error) {
    console.error("💥 Migration utility failed:", error);
    process.exit(1);
  }
}

// Run CLI if this file is executed directly
if (process.argv[1]?.endsWith('data-migration.ts') || process.argv[1]?.endsWith('data-migration.js')) {
  runCLI();
}