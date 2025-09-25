import { db } from "./db";
import { 
  ideas, 
  summitResources, 
  formFields, 
  formFieldOptions, 
  headerSettings, 
  kanbanCategories, 
  viewSettings,
  landingPageSettings
} from "@shared/schema";

async function seedDatabase() {
  console.log("🌱 Seeding database with default data...");

  try {
    // Clear existing data first
    await db.delete(ideas);
    await db.delete(summitResources);
    await db.delete(formFieldOptions);
    await db.delete(formFields);
    await db.delete(headerSettings);
    await db.delete(kanbanCategories);
    await db.delete(viewSettings);
    await db.delete(landingPageSettings);

    // Seed Kanban Categories
    console.log("📋 Seeding kanban categories...");
    await db.insert(kanbanCategories).values([
      {
        key: "ai_story",
        title: "AI Story",
        color: "#10b981",
        order: "0",
        isActive: "true"
      },
      {
        key: "ai_idea",
        title: "AI Idea", 
        color: "#3b82f6",
        order: "1",
        isActive: "true"
      },
      {
        key: "ai_solution",
        title: "AI Solution",
        color: "#8b5cf6",
        order: "2", 
        isActive: "true"
      }
    ]);

    // Seed Ideas
    console.log("💡 Seeding ideas...");
    await db.insert(ideas).values([
      {
        name: 'Sarah Chen',
        title: 'AI-Powered Code Review Assistant', 
        description: 'An intelligent system that automatically reviews code changes, suggests improvements, and identifies potential security vulnerabilities using machine learning models.',
        component: 'AI/ML',
        tag: 'automation',
        type: 'ai_solution'
      },
      {
        name: 'Alex Rodriguez',
        title: 'Smart Meeting Summarizer',
        description: 'Leverage natural language processing to automatically generate concise, actionable meeting summaries with key decisions, action items, and follow-up tasks.',
        component: 'Productivity',
        tag: 'collaboration',
        type: 'ai_idea'
      },
      {
        name: 'Jordan Kim',
        title: 'Intelligent Resource Allocation',
        description: 'Optimize compute resource allocation across environments using predictive analytics and historical usage patterns.',
        component: 'Infrastructure',
        tag: 'optimization',
        type: 'ai_idea'
      },
      {
        name: 'Taylor Swift',
        title: 'Developer Onboarding Chatbot',
        description: 'A conversational AI assistant that guides new developers through our codebase, development processes, and best practices.',
        component: 'Developer Experience',
        tag: 'onboarding',
        type: 'ai_story'
      },
      {
        name: 'Morgan Davis',
        title: 'Predictive Performance Monitoring',
        description: 'Use machine learning to predict system performance issues before they impact users, enabling proactive scaling and optimization.',
        component: 'Monitoring',
        tag: 'performance',
        type: 'ai_solution'
      }
    ]);

    // Seed Summit Resources
    console.log("🔗 Seeding summit resources...");
    await db.insert(summitResources).values([
      {
        title: "Summit Agenda",
        url: "https://example.com/agenda",
        description: "Full schedule of events and sessions",
        order: "0",
        isActive: "true"
      },
      {
        title: "Speaker Profiles",
        url: "https://example.com/speakers", 
        description: "Meet our keynote speakers and industry experts",
        order: "1",
        isActive: "true"
      },
      {
        title: "Workshop Materials",
        url: "https://example.com/workshops",
        description: "Resources and code samples for hands-on workshops",
        order: "2",
        isActive: "true"
      },
      {
        title: "Networking Hub",
        url: "https://example.com/networking",
        description: "Connect with fellow attendees and industry professionals",
        order: "3",
        isActive: "true"
      }
    ]);

    // Seed Form Fields
    console.log("📝 Seeding form fields...");
    const submitterNameField = await db.insert(formFields).values({
      name: "submitter_name",
      label: "Your Name",
      type: "text",
      required: "true",
      placeholder: "Enter your full name",
      order: "0",
      isActive: "true"
    }).returning();

    const ideaTitleField = await db.insert(formFields).values({
      name: "idea_title", 
      label: "Idea Title",
      type: "text",
      required: "true",
      placeholder: "Give your idea a catchy title",
      order: "1",
      isActive: "true"
    }).returning();

    const descriptionField = await db.insert(formFields).values({
      name: "description",
      label: "Description", 
      type: "textarea",
      required: "true",
      placeholder: "Describe your AI idea in detail",
      helpText: "Explain the problem you're solving and how AI can help",
      order: "2",
      isActive: "true"
    }).returning();

    const componentField = await db.insert(formFields).values({
      name: "component",
      label: "Component/Area",
      type: "text",
      required: "true", 
      placeholder: "e.g., AI/ML, Infrastructure, Frontend",
      order: "3",
      isActive: "true"
    }).returning();

    const tagField = await db.insert(formFields).values({
      name: "tag",
      label: "Tags",
      type: "text",
      required: "false",
      placeholder: "automation, performance, collaboration",
      helpText: "Add relevant tags to categorize your idea",
      order: "4", 
      isActive: "true"
    }).returning();

    const typeField = await db.insert(formFields).values({
      name: "type",
      label: "Category",
      type: "list",
      required: "true",
      placeholder: "Select a category",
      helpText: "Choose the category that best fits your submission",
      order: "5",
      isActive: "true"
    }).returning();

    // Seed Header Settings  
    console.log("🎨 Seeding header settings...");
    await db.insert(headerSettings).values({
      attendeeTitle: "AI Summit 2025",
      attendeeSubtitle: "Product & Engineering Innovation Hub",
      adminTitle: "Summit Admin Dashboard",
      adminSubtitle: "Manage your AI Summit content and ideas",
      summitResourcesLabel: "Summit Resources",
      backgroundColor: "#1e40af",
      textColor: "#ffffff",
      titleColor: "#ffffff",
      subtitleColor: "#e0e7ff"
    });

    // Seed View Settings
    console.log("👁️ Seeding view settings...");
    await db.insert(viewSettings).values({
      defaultView: "list",
      showBoardByDefault: "false"
    });

    // Seed Landing Page Settings
    console.log("🚀 Seeding landing page settings...");
    await db.insert(landingPageSettings).values({
      mode: "summit",
      maintenanceMessage: "The AI Summit platform is currently under construction. Please check back soon!",
      countdownMessage: "Time to start of the Pricefx Product & Engineering Summit",
      summitStartDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });

    console.log("✅ Database seeded successfully!");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run if called directly
seedDatabase()
  .then(() => {
    console.log("🎉 Seeding complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Seeding failed:", error);
    process.exit(1);
  });

export { seedDatabase };