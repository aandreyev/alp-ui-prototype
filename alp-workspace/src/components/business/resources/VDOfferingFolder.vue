<template>
  <div class="vd-offering-folder">
    <Card class="border-blue-200 bg-blue-50/50">
      <CardHeader class="pb-4">
        <div class="flex items-center gap-2">
          <FolderOpen class="w-5 h-5 text-blue-600" />
          <h3 class="font-medium text-blue-900">VD Offering Folder</h3>
        </div>
        <p class="text-sm text-blue-800">
          SharePoint folder with precedents and resources for this offering
        </p>
      </CardHeader>
      
      <CardContent class="pt-0">
        <div class="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <Folder class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 class="font-medium text-sm">{{ offering.name }}</h4>
              <p class="text-xs text-muted-foreground">SharePoint folder collection</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              @click="openFolder"
              class="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <ExternalLink class="w-4 h-4 mr-2" />
              Open Folder
            </Button>
          </div>
        </div>
        
        <!-- Additional info -->
        <div class="mt-3 flex items-center gap-4 text-xs text-blue-700">
          <span class="flex items-center gap-1">
            <Shield class="w-3 h-3" />
            SharePoint permissions apply
          </span>
          <span class="flex items-center gap-1">
            <Clock class="w-3 h-3" />
            Always current
          </span>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { 
  FolderOpen, 
  Folder, 
  ExternalLink, 
  Shield, 
  Clock 
} from 'lucide-vue-next'

import type { Offering } from '@/alp-types/resources.types'
import { Card, CardContent, CardHeader } from '@/lib/registry/new-york/ui/card'
import { Button } from '@/lib/registry/new-york/ui/button'

// Props
interface Props {
  offering: Offering
}

const props = defineProps<Props>()

// Methods
const openFolder = () => {
  if (props.offering.vdFolderUrl) {
    window.open(props.offering.vdFolderUrl, '_blank', 'noopener,noreferrer')
  }
}
</script>

<style scoped>
.vd-offering-folder {
  /* Component-specific styles */
}
</style>