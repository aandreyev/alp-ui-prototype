<template>
  <div class="relative">
    <!-- Button trigger -->
    <Button
      class="w-9 h-9 relative"
      variant="ghost"
      size="icon"
      @click="toggleDirectory"
    >
      <NotebookTabs class="w-5 h-5" />
    </Button>

    <!-- Staff Directory with portal -->
    <Teleport to="body">
      <transition name="slide-over" mode="out-in">
        <slide-over
          v-if="state.isOpen"
          heading="Staff Directory"
          @close="state.isOpen = false"
          class="fixed inset-y-0 right-0 z-50"
        >
          <div class="flex flex-col space-y-4 p-4">
            <!-- Search Bar -->
            <div class="flex w-full items-center">
              <form class="flex w-full items-center">
                <label for="simple-search" class="sr-only">Search</label>
                <div class="relative w-full">
                  <div
                    class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"
                  >
                    <svg
                      aria-hidden="true"
                      class="w-5 h-5 text-gray-500 dark:text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clip-rule="evenodd"
                      ></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="simple-search"
                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full pl-8 p-2"
                    placeholder="Search"
                    required
                    v-model="state.search"
                  />
                </div>
              </form>
            </div>

            <!-- Tabs -->
            <Tabs default-value="groups" class="w-full">
              <TabsList
                class="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground"
              >
                <TabsTrigger
                  value="people"
                  @click="state.selectedOption = 'people'"
                  class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <iconify-icon icon="lucide:book-user" class="mr-2 h-4 w-4" />
                  <span>People</span>
                </TabsTrigger>
                <TabsTrigger
                  value="groups"
                  @click="state.selectedOption = 'groups'"
                  class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <iconify-icon icon="lucide:mails" class="mr-2 h-4 w-4" />
                  <span>Groups</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="people"
                class="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <people
                  v-if="state.selectedOption === 'people'"
                  :search="state.search"
                  @close="state.isOpen = false"
                />
              </TabsContent>
              <TabsContent
                value="groups"
                class="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <email-group
                  v-if="state.selectedOption === 'groups'"
                  :search="state.search"
                  @close="state.isOpen = false"
                />
              </TabsContent>
            </Tabs>
          </div>
        </slide-over>
      </transition>
    </Teleport>
  </div>
</template>

<style scoped>
.slide-over-enter-active,
.slide-over-leave-active {
  transition: transform 0.3s ease;
}

.slide-over-enter-from,
.slide-over-leave-to {
  transform: translateX(100%);
}

.slide-over-enter-to,
.slide-over-leave-from {
  transform: translateX(0);
}

.z-50 {
  z-index: 50;
}
</style>
<script setup lang="ts">
import { NotebookTabs } from "lucide-vue-next";
import { reactive } from "vue";
import { Button } from "@/lib/registry/new-york/ui/button";
import SlideOver from "@/components/ui/layout/SlideOver.vue";
import People from "@/components/ui/directory/People.vue";
import EmailGroup from "@/components/ui/directory/EmailGroup.vue";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/lib/registry/new-york/ui/tabs";

const state = reactive({
  isOpen: false,
  selectedOption: "groups" as "people" | "groups",
  search: ""
});

function toggleDirectory() {
  state.isOpen = !state.isOpen;
}
</script>
