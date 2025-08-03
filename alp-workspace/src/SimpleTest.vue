<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">
        🧪 Portal Resources - Simple Test
      </h1>
      
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Environment Status</h2>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="font-medium">Vue:</span> 
            <span class="text-green-600">✅ Working</span>
          </div>
          <div>
            <span class="font-medium">TypeScript:</span> 
            <span class="text-green-600">✅ Working</span>
          </div>
          <div>
            <span class="font-medium">Tailwind CSS:</span> 
            <span class="text-green-600">✅ Working</span>
          </div>
          <div>
            <span class="font-medium">Vite HMR:</span> 
            <span class="text-green-600">✅ Working</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Component Testing</h2>
        <p class="text-gray-600 mb-4">
          Testing basic UI components before loading complex resource components.
        </p>
        
        <!-- Test Button Component -->
        <div class="mb-4">
          <h3 class="font-medium mb-2">Button Component Test:</h3>
          <div class="flex gap-2">
            <Button @click="handleClick('default')">Default Button</Button>
            <Button variant="outline" @click="handleClick('outline')">Outline Button</Button>
            <Button variant="secondary" @click="handleClick('secondary')">Secondary Button</Button>
          </div>
        </div>

        <!-- Test Card Component -->
        <div class="mb-4">
          <h3 class="font-medium mb-2">Card Component Test:</h3>
          <Card class="max-w-sm">
            <CardHeader>
              <CardTitle>Test Card</CardTitle>
              <CardDescription>This is a test card component</CardDescription>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-gray-600">Card content goes here.</p>
            </CardContent>
          </Card>
        </div>

        <!-- Test Icons -->
        <div class="mb-4">
          <h3 class="font-medium mb-2">Icon Component Test:</h3>
          <div class="flex gap-2 items-center">
            <Briefcase class="w-5 h-5 text-blue-600" />
            <FolderOpen class="w-5 h-5 text-green-600" />
            <AlertTriangle class="w-5 h-5 text-yellow-600" />
            <CheckCircle class="w-5 h-5 text-green-600" />
          </div>
        </div>

        <!-- Action Log -->
        <div v-if="lastAction" class="mt-4 p-3 bg-blue-50 rounded-lg">
          <p class="text-sm text-blue-800">
            <strong>Last Action:</strong> {{ lastAction }}
          </p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4">Next Steps</h2>
        <div class="space-y-2 text-sm">
          <div class="flex items-center gap-2">
            <CheckCircle class="w-4 h-4 text-green-600" />
            <span>Basic Vue app setup working</span>
          </div>
          <div class="flex items-center gap-2">
            <CheckCircle class="w-4 h-4 text-green-600" />
            <span>UI components (Button, Card) working</span>
          </div>
          <div class="flex items-center gap-2">
            <CheckCircle class="w-4 h-4 text-green-600" />
            <span>Icons (Lucide) working</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded-full bg-yellow-400"></div>
            <span>Ready to test resource components</span>
          </div>
        </div>
        
        <div class="mt-4">
          <Button @click="loadResourceTest" variant="default">
            Load Resource Components Test
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  Briefcase, 
  FolderOpen, 
  AlertTriangle, 
  CheckCircle 
} from 'lucide-vue-next'

// Import UI components
import { Button } from '@/lib/registry/new-york/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/registry/new-york/ui/card'

// State
const lastAction = ref<string>()

// Methods
const handleClick = (type: string) => {
  lastAction.value = `Clicked ${type} button at ${new Date().toLocaleTimeString()}`
  
  // Clear after 3 seconds
  setTimeout(() => {
    lastAction.value = undefined
  }, 3000)
}

const loadResourceTest = () => {
  lastAction.value = 'Loading resource components test...'
  
  // This will be where we transition to the full resource test
  setTimeout(() => {
    // For now, just show success
    lastAction.value = 'Ready to load ResourcesTestPage component'
  }, 1000)
}
</script>
