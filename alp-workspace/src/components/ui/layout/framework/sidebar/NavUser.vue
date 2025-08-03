<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarImage 
                :src="currentUser?.profilePictureUrl || '/default-profile-picture.png'" 
                :alt="currentUser?.email" 
              />
              <AvatarFallback class="rounded-lg">
                {{ currentUser?.email?.substring(0, 2).toUpperCase() }}
              </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">{{ currentUser?.email }}</span>
              <span class="truncate text-xs">{{ currentUser?.email }}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="end"
          :side-offset="4"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage 
                  :src="currentUser?.profilePictureUrl || '/default-profile-picture.png'" 
                  :alt="currentUser?.email" 
                />
                <AvatarFallback class="rounded-lg">
                  {{ currentUser?.email?.substring(0, 2).toUpperCase() }}
                </AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ currentUser?.email }}</span>
                <span class="truncate text-xs">{{ currentUser?.email }}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <!-- My Info Link -->
          <router-link :to="{ name: 'info' }">
            <DropdownMenuItem>My Info</DropdownMenuItem>
          </router-link>

          <DropdownMenuSeparator />
          
          <!-- Version Info -->
          <template v-if="versionChanged && showRefreshPrompt">
            <DropdownMenuItem class="text-amber-600 flex items-center gap-2" @click="refreshPage">
              <RefreshCw class="size-4" />
              <span>New version available - Click to update</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </template>
          <DropdownMenuItem v-else>
            Version {{ apiVersion }} {{ !versionChanged ? '(Up to date)' : '' }}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem class="flex items-center gap-2" @click="openServiceStatus">
            <span>Service Status</span>
            <iconify-icon icon="lucide:external-link" class="h-4 w-4">
            </iconify-icon>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <!-- Logout Button -->
          <DropdownMenuItem @click="logOut">Logout</DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
<script setup lang="ts">
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/lib/registry/new-york/ui/avatar'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/lib/registry/new-york/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/lib/registry/new-york/ui/sidebar'
import {
  ChevronsUpDown,
  RefreshCw,
} from 'lucide-vue-next'
import { useStore } from 'vuex'
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { UserStore } from '@/store/modules/users'
import { AuthStore } from "@/store/modules/auth";
import { router } from '@/router'
import { ApiInfoStore } from '@/store/modules/api'
import { useNotify } from '@/composable/notify'
import { toast } from 'vue-sonner'
import { CurrentUserDto } from '@/network/dtos/user-dto'

const store = useStore()
const { fireInfoToast } = useNotify()

// Get current user info
const currentUser = computed<CurrentUserDto>(
  () => store.getters[UserStore.getters.GET_ME]
)

// Get API version
const apiVersion = computed(
  () => store.getters[ApiInfoStore.getters.GET_API_VERSION]
)

// For version checking
const initialApiVersion = ref('')
const versionChanged = ref(false)
const showRefreshPrompt = ref(false)
let checkInterval: number | null = null

// Function to check version and show toast if needed
function checkVersionAndNotify() {
  const currentVersion = apiVersion.value
  
  // Skip if no version info yet
  if (!initialApiVersion.value || !currentVersion) {
    return
  }

  // Check if version changed
  if (currentVersion !== initialApiVersion.value) {
    versionChanged.value = true
    showRefreshPrompt.value = true
    
    // Show toast with update button
    toast.info('New application version available', {
      action: {
        label: 'Update now',
        onClick: refreshPage
      },
      duration: 10000
    })
  }
}

onMounted(() => {
  // Store initial version once it's available
  if (apiVersion.value) {
    initialApiVersion.value = apiVersion.value
  } else {
    // Wait for the API version to be set
    const unwatch = watch(apiVersion, (newVersion) => {
      if (newVersion) {
        initialApiVersion.value = newVersion
        unwatch()
      }
    })
  }

  // Set up periodic version check and notification
  checkInterval = window.setInterval(() => {
    store.dispatch(ApiInfoStore.actions.GET_API_VERSION).then(() => {
      checkVersionAndNotify()
    })
  }, 5 * 60 * 1000) // Check every 5 minutes
})

onUnmounted(() => {
  // Clear interval when component is unmounted
  if (checkInterval !== null) {
    clearInterval(checkInterval)
  }
})

// Function to refresh the page
function refreshPage() {
  // Clear the interval before refreshing
  if (checkInterval !== null) {
    clearInterval(checkInterval)
  }
  window.location.reload()
}

// Logout function
function logOut() {
  store.dispatch(AuthStore.actions.LOGOUT).then(() => {
    router.push({ name: 'Login' })
  })
}

const { isMobile } = useSidebar()

function openServiceStatus() {
  window.open('https://stats.uptimerobot.com/2ZsGF9zhbH', '_blank')
}
</script>