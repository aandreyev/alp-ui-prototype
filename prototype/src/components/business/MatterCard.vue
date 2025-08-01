<template>
  <Card class="w-full hover:shadow-md transition-shadow">
    <CardHeader class="pb-3">
      <div class="flex items-start justify-between">
        <div class="space-y-1 flex-1">
          <CardTitle class="text-base font-semibold leading-tight">
            {{ matter.name }}
          </CardTitle>
          <p class="text-sm text-muted-foreground">
            {{ matter.client.name }}
          </p>
        </div>
        <div class="flex items-center gap-2 ml-4">
          <Badge :variant="getStatusVariant(matter.status)">
            {{ matter.status }}
          </Badge>
          <Badge :variant="getPriorityVariant(matter.priority)" class="text-xs">
            {{ matter.priority }}
          </Badge>
        </div>
      </div>
    </CardHeader>

    <CardContent class="space-y-4">
      <!-- Progress Section -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span class="text-muted-foreground">Progress</span>
          <span class="font-medium">{{ matter.progress.completed }}/{{ matter.progress.total }}</span>
        </div>
        <Progress 
          :value="(matter.progress.completed / matter.progress.total) * 100" 
          class="h-2"
        />
      </div>

      <!-- Financial Overview -->
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-muted-foreground">Budget</p>
          <p class="font-semibold text-green-600">
            ${{ matter.estimatedBudget.toLocaleString() }}
          </p>
        </div>
        <div>
          <p class="text-muted-foreground">Actual</p>
          <p class="font-semibold" :class="getCostColor(matter.actualCosts, matter.estimatedBudget)">
            ${{ matter.actualCosts.toLocaleString() }}
          </p>
        </div>
      </div>

      <!-- Coordinator -->
      <div class="flex items-center gap-2">
        <Avatar class="h-6 w-6">
          <AvatarFallback class="text-xs bg-primary/10 text-primary">
            {{ matter.coordinator.initials }}
          </AvatarFallback>
        </Avatar>
        <span class="text-sm text-muted-foreground">{{ matter.coordinator.name }}</span>
      </div>

      <!-- Offerings -->
      <div class="flex flex-wrap gap-1">
        <Badge 
          v-for="offering in matter.offerings" 
          :key="offering.name"
          variant="outline" 
          class="text-xs"
          :style="{ borderColor: getOfferingColor(offering.color), color: getOfferingColor(offering.color) }"
        >
          {{ offering.name }}
        </Badge>
      </div>

      <!-- Due Date -->
      <div class="flex items-center justify-between text-sm pt-2 border-t">
        <span class="text-muted-foreground">Due Date</span>
        <span class="font-medium" :class="getDueDateColor(matter.dueDate)">
          {{ formatDate(matter.dueDate) }}
        </span>
      </div>
    </CardContent>

    <CardFooter class="pt-0">
      <div class="flex gap-2 w-full">
        <Button variant="outline" size="sm" class="flex-1" @click="viewDetails">
          <FileText class="h-4 w-4 mr-2" />
          View Details
        </Button>
        <Button variant="outline" size="sm" @click="createTimeEntry">
          <Clock class="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" @click="showActions">
          <MoreHorizontal class="h-4 w-4" />
        </Button>
      </div>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/lib/registry/new-york/ui/card'
import { Badge } from '@/lib/registry/new-york/ui/badge'
import { Button } from '@/lib/registry/new-york/ui/button'
import { Progress } from '@/lib/registry/new-york/ui/progress'
import { Avatar, AvatarFallback } from '@/lib/registry/new-york/ui/avatar'
import { FileText, Clock, MoreHorizontal } from 'lucide-vue-next'
import { usePrototypeStore } from '@/stores/prototype'
import type { Matter, MatterStatus, Priority } from '@/types'

interface Props {
  matter: Matter
  variant?: 'default' | 'compact'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
})

const store = usePrototypeStore()

// Interactive functions
const viewDetails = () => {
  store.openModal('ViewMatter', { matter: props.matter })
}

const createTimeEntry = () => {
  store.openModal('CreateTimeEntry', { matter: props.matter })
}

const showActions = () => {
  // Could show a dropdown menu or action sheet
  store.addNotification('info', 'Actions', 'More actions coming soon!')
}

const getStatusVariant = (status: MatterStatus) => {
  switch (status) {
    case 'Open': return 'default'
    case 'Closed': return 'secondary'
    case 'On Hold': return 'outline'
    case 'Cancelled': return 'destructive'
    default: return 'default'
  }
}

const getPriorityVariant = (priority: Priority) => {
  switch (priority) {
    case 'Urgent': return 'destructive'
    case 'High': return 'default'
    case 'Medium': return 'secondary'
    case 'Low': return 'outline'
    default: return 'outline'
  }
}

const getCostColor = (actual: number, budget: number) => {
  const percentage = (actual / budget) * 100
  if (percentage > 90) return 'text-red-600'
  if (percentage > 75) return 'text-yellow-600'
  return 'text-blue-600'
}

const getOfferingColor = (color: string) => {
  const colors: Record<string, string> = {
    blue: '#3b82f6',
    green: '#10b981',
    purple: '#8b5cf6',
    orange: '#f59e0b',
    red: '#ef4444',
    pink: '#ec4899',
    indigo: '#6366f1',
    teal: '#14b8a6'
  }
  return colors[color] || colors.blue
}

const getDueDateColor = (dueDate: string) => {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'text-red-600' // Overdue
  if (diffDays <= 3) return 'text-orange-600' // Due soon
  if (diffDays <= 7) return 'text-yellow-600' // Due this week
  return 'text-muted-foreground' // Normal
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}
</script>
