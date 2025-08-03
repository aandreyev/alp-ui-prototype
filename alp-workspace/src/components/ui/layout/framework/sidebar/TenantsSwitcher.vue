<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <template v-if="typeof activeTenant.logo === 'string'">
                <img :src="activeTenant.logo" class="size-4 object-contain" />
              </template>
              <component v-else :is="activeTenant.logo" class="size-4" />
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">
                {{ activeTenant.name }}
              </span>
              <span class="truncate text-xs">{{ activeTenant.plan }}</span>
            </div>
            <ChevronsUpDown class="ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          align="start"
          :side="isMobile ? 'bottom' : 'right'"
          :side-offset="4"
        >
          <DropdownMenuLabel class="text-xs text-muted-foreground">
            Tenants
          </DropdownMenuLabel>
          <DropdownMenuItem
            v-for="(tenant, index) in tenants"
            :key="tenant.name"
            class="gap-2 p-2"
            @click="activeTenant = tenant"
          >
            <div class="flex size-6 items-center justify-center rounded-sm border">
              <template v-if="typeof tenant.logo === 'string'">
                <img :src="tenant.logo" class="size-4 shrink-0 object-contain" />
              </template>
              <component v-else :is="tenant.logo" class="size-4 shrink-0" />
            </div>
            {{ tenant.name }}
            <!-- <DropdownMenuShortcut>⌘{{ index + 1 }}</DropdownMenuShortcut> -->
          </DropdownMenuItem>
          <!-- <DropdownMenuSeparator />
          <DropdownMenuItem class="gap-2 p-2">
            <div class="flex size-6 items-center justify-center rounded-md border bg-background">
              <Plus class="size-4" />
            </div>
            <div class="font-medium text-muted-foreground">
              Add tenant
            </div>
          </DropdownMenuItem> -->
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>

<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/lib/registry/new-york/ui/dropdown-menu'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/lib/registry/new-york/ui/sidebar'
import { AudioWaveform, ChevronsUpDown, Command, GalleryVerticalEnd, Plus } from 'lucide-vue-next'

import { type Component, ref } from 'vue'

interface Tenant {
  name: string
  logo: Component | string  // Can be either a Component or image URL
  plan: string
}

const tenants: Tenant[] = [
  {
    name: 'ADLV LAW',
    logo: '/20240925_Final_ADLV-Hex_IH.png',
    plan: 'Enterprise',
  }
]

const { isMobile } = useSidebar()
const activeTenant = ref(tenants[0])
</script>