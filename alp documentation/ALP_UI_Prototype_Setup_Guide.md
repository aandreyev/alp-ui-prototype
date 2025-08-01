# ALP UI Rapid Prototyping Environment

## 🚀 **Simple AI-First Prototyping Setup**

Create a rapid prototyping environment that **matches your existing ALP stack** - perfect for AI-driven component development with instant visual feedback.

---

## 📋 **Quick Setup (5 minutes)**

### **Prerequisites:**
- **Node.js 18+** and **npm**
- **Cursor IDE** with MCP Browser extension

### **Step 1: Create Vite + Vue Project**

```bash
# Create minimal Vue 3 + TypeScript setup
npm create vue@latest alp-ui-prototype -- --typescript --router --pinia

cd alp-ui-prototype
npm install

# Install exact ALP dependencies 
npm install @headlessui/vue @radix-icons/vue radix-vue
npm install class-variance-authority clsx tailwind-merge
npm install tailwindcss @tailwindcss/forms tailwindcss-animate postcss autoprefixer
npm install @fortawesome/fontawesome-svg-core @fortawesome/free-solid-svg-icons @fortawesome/vue-fontawesome
npm install lucide-vue-next
```

### **Step 2: Copy ALP Design System**

```bash
# Copy exact ALP configuration files
cp ALP-reference/ALP/App/tailwind.config.js .
cp ALP-reference/ALP/App/postcss.config.js .
cp ALP-reference/ALP/App/components.json .

# Copy complete ALP component library and styles
cp -r ALP-reference/ALP/App/src/lib ./src/
cp -r ALP-reference/ALP/App/src/assets ./src/
```

### **Step 3: Configure Package Scripts**

Add to `package.json`:
```json
{
  "scripts": {
    "dev": "vite --port 5173 --host",
    "prototype": "npm run dev"
  }
}
```

### **Step 4: Create AI Prototype Playground**

Replace `src/App.vue`:
```vue
<template>
  <div class="min-h-screen bg-background">
    <!-- AI Prototype Header -->
    <header class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-14 items-center">
        <h1 class="text-lg font-semibold">🤖 ALP AI Prototype Playground</h1>
      </div>
    </header>

    <!-- AI Component Testing Area -->
    <main class="container py-8 space-y-8">
      
      <!-- Quick Component Tests - AI can add components here -->
      <section class="space-y-4">
        <h2 class="text-xl font-semibold">🧪 Component Tests</h2>
        
        <!-- Example: AI builds components and tests them here -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MatterCard :matter="sampleMatter" />
          <MatterCard :matter="sampleMatter2" variant="compact" />
        </div>
      </section>

      <!-- Component Variants - AI can test different states -->
      <section class="space-y-4">
        <h2 class="text-xl font-semibold">🎯 Variant Testing</h2>
        
        <div class="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="destructive">Delete</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      <!-- AI Experiments Section -->
      <section class="space-y-4">
        <h2 class="text-xl font-semibold">🚧 AI Experiments</h2>
        <div class="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <p class="text-muted-foreground">AI can build and test new components here</p>
        </div>
      </section>
      
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/lib/registry/new-york/ui/button/Button.vue'
import { type Matter } from '@/types'

// AI can modify this test data in real-time  
const sampleMatter = ref<Matter>({
  id: 1,
  name: "Property Purchase - 123 Main St",
  client: { name: "John Smith", email: "john@email.com" },
  status: "Open",
  priority: "High",
  coordinator: { name: "Sarah Johnson", initials: "SJ", email: "sarah@alp.com" },
  progress: { completed: 7, total: 12 },
  estimatedBudget: 15000,
  actualCosts: 8500,
  dueDate: "2024-02-15",
  offerings: [
    { name: "Property Purchase", color: "blue" },
    { name: "Mortgage Assistance", color: "green" }
  ]
})

const sampleMatter2 = ref<Matter>({
  id: 2,
  name: "Estate Planning - Wilson Family",
  client: { name: "Robert & Mary Wilson", email: "rwilson@email.com" },
  status: "On Hold", 
  priority: "Medium",
  coordinator: { name: "Michael Chen", initials: "MC", email: "michael@alp.com" },
  progress: { completed: 3, total: 8 },
  estimatedBudget: 8000,
  actualCosts: 2100,
  dueDate: "2024-03-20",
  offerings: [
    { name: "Will Preparation", color: "purple" },
    { name: "Trust Setup", color: "orange" }
  ]
})
</script>
```

### **Step 5: Add TypeScript Types**

Create `src/types/index.ts`:
```typescript
export interface Matter {
  id: number
  name: string
  client: ClientInfo
  status: MatterStatus
  priority: Priority
  coordinator: User
  progress: Progress
  estimatedBudget: number
  actualCosts: number
  dueDate: string
  offerings: Offering[]
  outcomes?: Outcome[]
}

export interface ClientInfo {
  name: string
  email: string
  phone?: string
}

export type MatterStatus = 'Open' | 'Closed' | 'On Hold' | 'Cancelled'
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent'

export interface User {
  name: string
  initials: string
  email: string
  avatar?: string
}

export interface Progress {
  completed: number
  total: number
  percentage?: number
}

export interface Offering {
  name: string
  color: string
  id?: number
}

export interface Outcome {
  id: number
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
}
```

### **Step 6: Start Rapid Prototyping**

```bash
# Start development server with hot reload
npm run prototype

# Open in browser for MCP AI visual feedback
open http://localhost:5173
```

---

## 🤖 **AI Development Workflow**

### **1. Component Creation**
```typescript
// AI Prompt: "Create a MatterCard component with status badges"
// AI creates: src/components/MatterCard.vue
// AI adds to: src/App.vue playground for testing
```

### **2. Instant Visual Feedback**
```typescript
// 1. AI writes component code
// 2. Hot reload updates browser instantly  
// 3. AI sees result via MCP browser
// 4. AI makes adjustments
// 5. Repeat until perfect
```

### **3. Component Testing**
```vue
<!-- AI can test multiple states simultaneously -->
<MatterCard :matter="sampleMatter" />
<MatterCard :matter="sampleMatter" variant="compact" />
<MatterCard :matter="sampleMatter" status="loading" />
```

---

## ✅ **What You Get**

- ✅ **Exact ALP styling** (shadcn/ui New York + Tailwind)
- ✅ **All ALP components** (buttons, forms, dialogs, etc.)
- ✅ **Instant hot reload** (Vite HMR)
- ✅ **AI visual feedback** (MCP browser integration)
- ✅ **TypeScript support** (full type safety)
- ✅ **Single playground** (no complex navigation)
- ✅ **Rapid iteration** (AI builds + tests components)

---

## 🎯 **Perfect For:**

- 🚀 **Rapid component prototyping**
- 🤖 **AI-driven development**
- 🎨 **Design system testing**
- 📱 **Responsive design validation**
- 🔧 **Component refinement**

---

## 📂 **Simple Structure**

```
alp-ui-prototype/
├── src/
│   ├── App.vue              # 🎯 AI playground
│   ├── components/          # 🧱 New components  
│   ├── types/               # 📝 TypeScript types
│   ├── lib/                 # 📦 ALP components (copied)
│   └── assets/              # 🎨 ALP styles (copied)
├── tailwind.config.js       # ⚙️ ALP config (copied)
├── postcss.config.js        # ⚙️ ALP config (copied)
└── components.json          # ⚙️ shadcn config (copied)
```

**Ready for AI-first rapid prototyping!** 🚀🤖

---

## 🛠️ **Next Steps**

1. **Start prototyping**: `npm run prototype`
2. **AI builds components** in `src/components/`
3. **AI tests components** in `App.vue` playground
4. **AI iterates** with instant visual feedback
5. **Copy finished components** to main ALP app
