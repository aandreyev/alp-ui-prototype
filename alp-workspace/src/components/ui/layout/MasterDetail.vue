<template>
  <ScrollArea class="flex">
    <div class="flex w-full flex-col bg-white">
      <div class="flex flex-col">
        <header
          class="sticky top-0 z-20 flex pt-2 pl-4 items-center gap-4 bg-background/80 backdrop-blur-lg"
        >
          <Breadcrumb class="md:flex">
            <BreadcrumbList class="list-none">
              <BreadcrumbItem>
                <BreadcrumbLink as-child>
                  <router-link to="/">
                    <span>Dashboard</span>
                  </router-link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator v-if="backLink" />
              <BreadcrumbItem>
                <BreadcrumbLink as-child>
                  <div v-if="backLink">
                    <router-link :to="backLink.link">
                      <span>{{ backLink.name }}</span>
                    </router-link>
                  </div>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  <template class="text-left" v-for="link in links">
                    <router-link
                      v-if="canAll(link.permissions)"
                      :key="link.link"
                      custom
                      :to="link.link"
                      v-slot="{ isActive }"
                    >
                      <span v-if="isActive">{{ link.name }} </span>
                    </router-link>
                  </template>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div class="overflow-y-auto flex-1">
          <main
            class="grid flex-1 items-start px-2 py-2 gap-1 md:gap-1 lg:px-4"
          >
            <slot />

            <nav>
              <ScrollArea
                class="max-w-[480px] md:max-w-[600px] lg:max-w-[1000px] 2xl:max-w-none pb-3"
              >
                <ul
                  ref="navigation"
                  id="navigation"
                  class="flex items-start text-center list-none p-0"
                >
                  <li
                    v-for="link in links"
                    :key="link.link"
                    class="mr-1 md:mr-1"
                  >
                    <router-link
                      v-if="canAll(link.permissions)"
                      custom
                      :to="link.link"
                      v-slot="{ isActive, navigate }"
                    >
                      <a
                        href="#"
                        class="flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors hover:text-primary whitespace-nowrap"
                        @click="navigate"
                        :class="[
                          isActive
                            ? 'bg-muted font-medium text-primary'
                            : 'text-muted-foreground'
                        ]"
                      >
                        <iconify-icon
                          :icon="link.icon"
                          v-if="link.icon"
                          class="mr-2 md:inline-block hidden"
                        />
                        <span v-if="!isHideTabsName">{{ link.name }}</span>
                      </a>
                    </router-link>
                  </li>
                </ul>
                <ScrollBar orientation="horizontal" class="" />
              </ScrollArea>
            </nav>
            <ScrollArea className="w-full flex flex-col gap-y-4 ">
              <router-view />
              <ScrollBar />
            </ScrollArea>
          </main>
        </div>
      </div>
    </div>
  </ScrollArea>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, watch, onUnmounted, computed } from "vue";
import { useCan } from "@/composable/can";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/lib/registry/new-york/ui/breadcrumb";
import { ScrollArea, ScrollBar } from "@/lib/registry/new-york/ui/scroll-area";

interface Link {
  link: string;
  name: string;
  permissions: string[];
  icon: string;
}

interface Props {
  backLink?: {
    link: any;
    name: string;
  };
  options?: { name: string; onClick: () => void }[];
  links: any;
}

const props = withDefaults(defineProps<Props>(), {
  backLink: undefined,
  options: () => [],
  links: () => []
});

const { canAll } = useCan();

const navigation = ref<HTMLElement | null>(null);
const state = reactive({
  isHideTabsName: false
});

// Expose necessary properties and methods
defineExpose({
  canAll,
  isHideTabsName: computed(() => state.isHideTabsName)
});
</script>

<style scoped></style>
