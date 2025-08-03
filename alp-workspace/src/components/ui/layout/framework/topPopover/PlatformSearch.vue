<template>
  <div class="w-full flex-1">
    <form>
      <div class="relative">
        <shad-button
          variant="outline"
          class="relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
          @click.prevent="isOpen = true"
        >
          <span class="hidden lg:inline-flex">Search platform...</span>
          <span class="inline-flex lg:hidden">Search...</span>
          <Kbd
            class="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex"
          >
            <span class="text-xs">Ctrl (⌘) + </span>K
          </Kbd>
        </shad-button>
      </div>
    </form>
    <Dialog v-model:open="isOpen" @update:open="handleDialogUpdate">
      <DialogContent class="p-0 sm:max-w-[1000px]">
        <Command class="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Search..."
            class="border-none"
            :value="currentSearchValue"
            @input="handleSearch"
          />
          <CommandEmpty v-if="!isLoading && searchResults?.length === 0">
            🐿️ The squirrel ate the data.
          </CommandEmpty>
          <CommandList
            class="max-h-[500px] overflow-y-auto"
            @escape-key-down="isOpen = false"
          >
            <!-- Search results -->
            <div class="p-4">
              <!-- Top Result -->
              <div v-if="currentSearchValue.length >= 2" class="mb-4">
                <h2 class="text-base font-semibold mb-2">Top Result</h2>
                <template v-if="isLoading">
                  <div class="p-2 bg-muted/50 rounded-lg animate-pulse">
                    <div class="flex items-center gap-2">
                      <div class="h-8 w-8 rounded-md bg-muted"></div>
                      <div class="flex flex-col gap-1.5 flex-1">
                        <div class="h-4 w-48 bg-muted rounded"></div>
                        <div class="h-2.5 w-32 bg-muted rounded"></div>
                      </div>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <CommandItem
                    v-if="searchResults && searchResults.length > 0"
                    :value="`top_result_${searchResults[0]?.title}`"
                    class="p-2 bg-muted/50 rounded-lg hover:bg-muted/80"
                    @select="handleSelectSearchResult(searchResults[0])"
                  >
                    <div class="flex items-center gap-2 w-full">
                      <div class="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                        <iconify-icon
                          :icon="searchResults[0]?.fileExtension ? 'lucide:file-text' : 'lucide:folder'"
                          class="h-4 w-4 text-white"
                        />
                      </div>
                      <div class="flex flex-col gap-0.5">
                        <span class="font-medium text-sm">{{ searchResults[0]?.title }}</span>
                        <span class="text-[10px] text-muted-foreground">
                          {{ searchResults[0]?.author || "Unknown" }} modified on
                          {{ format(new Date(searchResults[0]?.lastModifiedTime), "dd MMM yyyy") }}
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                  <div v-else class="p-2 text-center text-xs">
                    🐿️ The squirrel ate the data.
                  </div>
                </template>
              </div>

              <!-- Categories -->
              <div
                class="grid grid-cols-1"
                :class="{
                  'md:grid-cols-3': currentSearchValue,
                  'md:grid-cols-1': !currentSearchValue
                }"
              >
                <!-- Quick Links -->
                <div class="col-span-1">
                  <h2 class="text-lg font-semibold mb-4">Quick Access</h2>
                  <CommandGroup>
                    <div v-for="item in filteredAllLinks" :key="item.group">
                      <div v-for="subItem in item.links" :key="subItem.title">
                        <alp-can :permission="subItem.permission">
                          <CommandItem
                            :value="`quick_access_${subItem.title}`"
                            class="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg"
                            @select="handleSelectLink(subItem)"
                          >
                            <div
                              class="h-10 w-10 rounded bg-muted flex items-center justify-center"
                            >
                              <iconify-icon
                                :icon="subItem.icon"
                                class="h-5 w-5"
                              />
                            </div>
                            <div class="flex flex-col">
                              <span class="font-medium">{{
                                subItem.title
                              }}</span>
                              <span class="text-sm text-muted-foreground">{{
                                item.group
                              }}</span>
                            </div>
                          </CommandItem>
                        </alp-can>
                      </div>
                    </div>
                  </CommandGroup>
                </div>

                <!--SharePoint Results Section -->
                <div v-if="currentSearchValue.length >= 2" class="col-span-2">
                  <Tabs :default-value="platformSearchTabs[0]" class="relative mr-auto w-full">
                    <div class="flex items-center justify-between pb-3">
                      <TabsList class="w-full justify-start rounded-none border-b bg-transparent p-0">
                        <TabsTrigger
                          v-for="(tab, index) in platformSearchTabs"  
                          :key="index"
                          :value="tab"
                          class="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
                        >
                          {{ tab }}
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent v-for="(tab, index) in platformSearchTabs" :key="index" :value="tab" class="relative space-y-10">
                      <template v-if="tab === 'SharePoint'">
                        <div class="flex items-center justify-between">
                          <h2 class="text-base font-semibold">SharePoint Search</h2>
                          <shad-button
                            v-if="!isLoading && searchResults.length"
                            variant="ghost"
                            size="sm"
                            class="h-7 px-2"
                            @click="viewAll"
                          >
                            View all
                          </shad-button>
                        </div>

                        <div class="flex flex-col gap-1.5">
                          <template v-if="isLoading">
                            <div
                              v-for="n in 5"
                              :key="n"
                              class="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                            >
                              <div class="h-8 w-8 rounded-md bg-muted animate-pulse"></div>
                              <div class="flex flex-col gap-1.5 flex-1">
                                <div class="h-4 w-48 bg-muted rounded animate-pulse"></div>
                                <div class="h-3 w-full bg-muted rounded animate-pulse"></div>
                                <div class="h-2.5 w-32 bg-muted rounded animate-pulse"></div>
                              </div>
                            </div>
                          </template>
                          <template v-else-if="!searchResults.length">
                            <div class="p-2 text-center text-xs">
                              🐿️ The squirrel ate the data.
                            </div>
                          </template>
                          <template v-else>
                            <div
                              v-for="(result, index) in displayedResults"
                              :key="`search-result-${index}`"
                              :value="`search-result-${index}`"
                              class="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-lg cursor-pointer"
                              @click="handleSelectSearchResult(result)"
                            >
                              <div class="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                <iconify-icon
                                  :icon="result.fileExtension ? 'lucide:file-text' : 'lucide:folder'"
                                  class="h-4 w-4"
                                />
                              </div>
                              <div class="flex flex-col gap-0.5">
                                <span class="font-medium text-sm">{{ result.title }}</span>
                                <span class="text-[10px] text-muted-foreground">
                                  {{ result.author || "Unknown" }} modified on
                                  {{
                                    result.lastModifiedTime
                                      ? format(new Date(result.lastModifiedTime), "dd MMM yyyy")
                                      : "Unknown date"
                                  }}
                                </span>
                              </div>
                            </div>
                            <div v-if="hasMoreResults" class="p-1 text-center">
                              <shad-button variant="ghost" size="sm" class="h-7 px-2" @click="showMoreResults">
                                Show More
                              </shad-button>
                            </div>
                          </template>
                        </div>
                      </template>
                      <template v-else-if="tab === 'Matters'">
                        <div class="flex items-center justify-between">
                          <h2 class="text-base font-semibold">Matters Search</h2>
                          <shad-button
                            v-if="!isLoadingMatters && matters?.length"
                            variant="ghost"
                            size="sm"
                            class="h-7 px-2"
                            @click="viewAllMatters"
                          >
                            View all
                          </shad-button>
                        </div>

                        <div class="flex flex-col gap-1.5">
                          <template v-if="isLoadingMatters">
                            <div
                              v-for="n in 5"
                              :key="n"
                              class="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                            >
                              <div class="h-8 w-8 rounded-md bg-muted animate-pulse"></div>
                              <div class="flex flex-col gap-1.5 flex-1">
                                <div class="h-4 w-48 bg-muted rounded animate-pulse"></div>
                                <div class="h-2.5 w-32 bg-muted rounded animate-pulse"></div>
                              </div>
                            </div>
                          </template>

                          <template v-else-if="!matters?.length">
                            <div class="p-2 text-center text-xs">
                              🐿️ The squirrel ate the matter data.
                            </div>
                          </template>
                          <template v-else>
                            <div
                              v-for="matter in matters"
                              :key="matter.id"
                              class="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-lg cursor-pointer"
                              @click="handleSelectMatter(matter)"
                            >
                              <div class="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                <iconify-icon
                                  icon="lucide:scale"
                                  class="h-4 w-4"
                                />
                              </div>
                              <div class="flex flex-col gap-0.5 flex-1">
                                <div class="flex items-center justify-between">
                                  <span class="font-medium text-sm">{{ matter.name }}</span>
                                  <span class="text-[10px] text-muted-foreground ml-2">
                                    [{{ matter.id }}]
                                  </span>
                                </div>
                                <span class="text-xs text-muted-foreground truncate">
                                  {{ matter.client?.clientName }}
                                </span>
                                <span class="text-[10px] text-muted-foreground">
                                  {{ matter.reviewer?.fullName || "Unknown" }} • {{ matter.coordinator?.fullName || "Unknown" }}
                                </span>
                              </div>
                            </div>
                          </template>
                        </div>
                      </template>
                      <template v-else-if="tab === 'Clients'">
                        <div class="flex items-center justify-between">
                          <h2 class="text-base font-semibold">Clients Search</h2>
                          <shad-button
                            v-if="!isLoadingClients && clients?.length"
                            variant="ghost"
                            size="sm"
                            class="h-7 px-2"
                            @click="viewAllClients"
                          >
                            View all
                          </shad-button>
                        </div>

                        <div class="flex flex-col gap-1.5">
                          <template v-if="isLoadingClients">
                            <div
                              v-for="n in 5"
                              :key="n"
                              class="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                            >
                              <div class="h-8 w-8 rounded-md bg-muted animate-pulse"></div>
                              <div class="flex flex-col gap-1.5 flex-1">
                                <div class="h-4 w-48 bg-muted rounded animate-pulse"></div>
                                <div class="h-2.5 w-32 bg-muted rounded animate-pulse"></div>
                              </div>
                            </div>
                          </template>
                          <template v-else-if="!clients?.length">
                            <div class="p-2 text-center text-xs">
                              🐿️ The squirrel ate the client data.
                            </div>
                          </template>
                          <template v-else>
                            <div
                              v-for="client in clients"
                              :key="client.id"
                              class="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-lg cursor-pointer"
                              @click="handleSelectClient(client)"
                            >
                              <div class="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                <iconify-icon
                                  icon="lucide:users"
                                  class="h-4 w-4"
                                />
                              </div>
                              <div class="flex flex-col gap-0.5 flex-1">
                                <div class="flex items-center justify-between">
                                  <span class="font-medium text-sm">{{ client.clientName }}</span>
                                  <span class="text-[10px] text-muted-foreground ml-2">
                                    [{{ client.id }}]
                                  </span>
                                </div>
                                <span v-if="client.email" class="text-xs text-muted-foreground truncate">
                                  {{ client.email }}
                                </span>
                              </div>
                            </div>
                          </template>
                        </div>
                      </template>
                      <template v-else-if="tab === 'Projects'">
                        <div class="flex items-center justify-between">
                          <h2 class="text-base font-semibold">Projects Search</h2>
                          <shad-button
                            v-if="!isLoadingProjects && projects?.length"
                            variant="ghost"
                            size="sm"
                            class="h-7 px-2"
                            @click="viewAllProjects"
                          >
                            View all
                          </shad-button>
                        </div>

                        <div class="flex flex-col gap-1.5">
                          <template v-if="isLoadingProjects">
                            <div
                              v-for="n in 5"
                              :key="n"
                              class="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                            >
                              <div class="h-8 w-8 rounded-md bg-muted animate-pulse"></div>
                              <div class="flex flex-col gap-1.5 flex-1">
                                <div class="h-4 w-48 bg-muted rounded animate-pulse"></div>
                                <div class="h-2.5 w-32 bg-muted rounded animate-pulse"></div>
                              </div>
                            </div>
                          </template>
                          <template v-else-if="!projects?.length">
                            <div class="p-2 text-center text-xs">
                              🐿️ The squirrel ate the project data.
                            </div>
                          </template>
                          <template v-else>
                            <div
                              v-for="project in projects"
                              :key="project.id"
                              class="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-lg cursor-pointer"
                              @click="handleSelectProject(project)"
                            >
                              <div class="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                <iconify-icon
                                  icon="lucide:kanban"
                                  class="h-4 w-4"
                                />
                              </div>
                              <div class="flex flex-col gap-0.5 flex-1">
                                <div class="flex items-center justify-between">
                                  <span class="font-medium text-sm">{{ project.name }}</span>
                                  <span class="text-[10px] text-muted-foreground ml-2">
                                    [{{ project.id }}]
                                  </span>
                                </div>
                                <span class="text-xs text-muted-foreground truncate">
                                  {{ project.businessArea?.name }}
                                </span>
                                <span class="text-[10px] text-muted-foreground">
                                  {{ project.complete ? 'Completed' : 'Open' }} • Due {{ project.dueDate ? format(new Date(project.dueDate), "dd MMM yyyy") : 'N/A' }}
                                </span>
                              </div>
                            </div>
                          </template>
                        </div>
                      </template>
                      <template v-else-if="tab === 'Invoices'">
                        <div class="flex items-center justify-between">
                          <h2 class="text-base font-semibold">Invoices Search</h2>
                          <shad-button
                            v-if="!isLoadingInvoices && invoices?.length"
                            variant="ghost"
                            size="sm"
                            class="h-7 px-2"
                            @click="viewAllInvoices"
                          >
                            View all
                          </shad-button>
                        </div>

                        <div class="flex flex-col gap-1.5">
                          <template v-if="isLoadingInvoices">
                            <div
                              v-for="n in 5"
                              :key="n"
                              class="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                            >
                              <div class="h-8 w-8 rounded-md bg-muted animate-pulse"></div>
                              <div class="flex flex-col gap-1.5 flex-1">
                                <div class="h-4 w-48 bg-muted rounded animate-pulse"></div>
                                <div class="h-2.5 w-32 bg-muted rounded animate-pulse"></div>
                              </div>
                            </div>
                          </template>
                          <template v-else-if="!invoices?.length">
                            <div class="p-2 text-center text-xs">
                              🐿️ The squirrel ate the invoice data.
                            </div>
                          </template>
                          <template v-else>
                            <div
                              v-for="invoice in invoices"
                              :key="invoice.id"
                              class="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-lg cursor-pointer"
                              @click="handleSelectInvoice(invoice)"
                            >
                              <div class="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                <iconify-icon
                                  icon="lucide:receipt"
                                  class="h-4 w-4"
                                />
                              </div>
                              <div class="flex flex-col gap-0.5 flex-1">
                                <div class="flex items-center justify-between">
                                  <span class="font-medium text-sm">Invoice #{{ invoice.invoiceNumber }}</span>
                                  <span class="text-[10px] text-muted-foreground ml-2">
                                    [{{ invoice.id }}]
                                  </span>
                                </div>
                                <span class="text-xs text-muted-foreground truncate">
                                  {{ invoice.matter?.name }} • {{ invoice.matter?.client?.clientName }}
                                </span>
                                <span class="text-[10px] text-muted-foreground">
                                  {{ invoice.isInvoicePaid ? 'Paid' : 'Unpaid' }} • Due {{ invoice.dueDate ? format(new Date(invoice.dueDate), "dd MMM yyyy") : 'N/A' }}
                                </span>
                              </div>
                            </div>
                          </template>
                        </div>
                      </template>
                      <template v-else>
                        <div class="p-4 text-center text-muted-foreground">
                          Coming soon...
                        </div>
                      </template>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import Kbd from "@/lib/registry/new-york/components/Kbd.vue";
import { Dialog, DialogContent } from "@/lib/registry/new-york/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/lib/registry/new-york/ui/command";
import { debounce } from "lodash";
import { useStore } from "vuex";
import { SharePointStore } from "@/store/modules/sharepoint";
import { allUserLinks, allAdminLinks } from "../navLinks";
import { useRouter } from "vue-router";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/registry/new-york/ui/tabs";
import { MatterStore } from "@/store/modules/matters";
import { ClientStore } from "@/store/modules/clients";

import { ProjectStore } from "@/store/modules/projects";
import { InvoiceStore } from "@/store/modules/invoices";

const store = useStore();
const router = useRouter();
const isOpen = ref(false);

// Add these refs
const matters = ref<Matter[]>([]);
const isLoadingMatters = ref(false);

const platformSearchTabs = ref(["SharePoint", "Matters", "Clients", "Projects", "Invoices"]);

// Update the SearchResult interface
interface SearchResult {
  uniqueId: string;
  fileExtension: string | null;
  description: string | null;
  author: string | null;
  title: string;
  path: string;
  lastModifiedTime: string;
}

// Update the searchResults ref type
const searchResults = ref<SearchResult[]>([]);
const isLoading = ref(false);

const displayLimit = ref(5);
const displayedResults = computed(() => {
  return searchResults.value.slice(0, displayLimit.value);
});

const hasMoreResults = computed(() => {
  return searchResults.value.length > displayLimit.value;
});

const debouncedSearch = debounce(async (query: string) => {
  if (query.length >= 2) {
    isLoading.value = true;
    searchResults.value = [];
    try {
      const results = await store.dispatch(SharePointStore.actions.SEARCH, {
        query
      });
      if (query === currentSearchValue.value) {
        if (Array.isArray(results)) {
          searchResults.value = results.filter(
            (result) => result && result.uniqueId && result.title && result.path
          );
        } else {
          console.error("Invalid search results format:", results);
          searchResults.value = [];
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      searchResults.value = [];
    } finally {
      isLoading.value = false;
    }
  } else {
    searchResults.value = [];
  }
}, 300);

//  Update Matter interface
interface Matter {
  id: number;
  name: string;
  description: string | null;
  matterNumber: string;
  lastModifiedTime?: string;
  lastModifiedBy?: string;
  client?: {
    clientName: string;
  };
  status?: number;
  reviewer?: {
    fullName: string;
  };
  coordinator?: {
    fullName: string;
  };
}

const debouncedMatterSearch = debounce(async (query: string) => {
  if (query.length >= 2) {
    isLoadingMatters.value = true;
    matters.value = [];
    try {
      await store.dispatch(MatterStore.actions.GET_MATTERS_DATATABLE, {
        search: query,
        limit: 10,
        offset: 0,
        filters: {
          IsFilterApplied: false
        }
      });
      
      if (query === currentSearchValue.value) {
        const results = store.getters[MatterStore.getters.GET_MATTERS_DATATABLE];
        matters.value = results?.data?.items || [];
      }
    } catch (error) {
      console.error("Matter search error:", error);
      matters.value = [];
    } finally {
      isLoadingMatters.value = false;
    }
  } else {
    matters.value = [];
  }
}, 300);

// Update Client interface
interface Client {
  id: number;
  clientName: string;
  status: number;
  email?: string;  // Add email field
}

// Add refs
const clients = ref<Client[]>([]);
const isLoadingClients = ref(false);

// Add search function
const debouncedClientSearch = debounce(async (query: string) => {
  if (query.length >= 2) {
    isLoadingClients.value = true;
    clients.value = [];
    try {
      await store.dispatch(ClientStore.actions.GET_CLIENTS, {
        search: query,
        limit: 10,
        offset: 0
      });
      
      if (query === currentSearchValue.value) {
        const results = store.getters[ClientStore.actions.GET_CLIENTS];
        clients.value = results?.data?.items || [];
      }
    } catch (error) {
      console.error("Client search error:", error);
      clients.value = [];
    } finally {
      isLoadingClients.value = false;
    }
  } else {
    clients.value = [];
  }
}, 300);

// Add interface
interface Project {
  id: number;
  name: string;
  businessArea?: {
    name: string;
  };
  dueDate?: string;
  complete?: boolean;
}

// Add refs
const projects = ref<Project[]>([]);
const isLoadingProjects = ref(false);

// Add search function
const debouncedProjectSearch = debounce(async (query: string) => {
  if (query.length >= 2) {
    isLoadingProjects.value = true;
    projects.value = [];
    try {
      await store.dispatch(ProjectStore.actions.GET_PROJECTS, {
        search: query,
        limit: 10,
        offset: 0,
        filters: {
          IsFilterApplied: false
        }
      });
      
      if (query === currentSearchValue.value) {
        const results = store.getters[ProjectStore.getters.GET_PROJECTS];
        projects.value = results?.data?.items || [];
      }
    } catch (error) {
      console.error("Project search error:", error);
      projects.value = [];
    } finally {
      isLoadingProjects.value = false;
    }
  } else {
    projects.value = [];
  }
}, 300);

// Add interface
interface Invoice {
  id: number;
  invoiceNumber: string;
  matter?: {
    id: number;
    name: string;
    client?: {
      clientName: string;
    };
  };
  totalInvoiceAmountInclGst?: number;
  outstandingAmount?: number;
  isInvoicePaid?: boolean;
  status?: number;
  dueDate?: string;
}

// Add refs
const invoices = ref<Invoice[]>([]);
const isLoadingInvoices = ref(false);

// Add search function
const debouncedInvoiceSearch = debounce(async (query: string) => {
  if (query.length >= 2) {
    isLoadingInvoices.value = true;
    invoices.value = [];
    try {
      await store.dispatch(InvoiceStore.actions.GET_INVOICES_DATATABLE, {
        search: query,
        limit: 10,
        offset: 0,
        filters: {
          IsFilterApplied: false
        }
      });
      
      if (query === currentSearchValue.value) {
        const results = store.getters[InvoiceStore.getters.GET_INVOICES_DATATABLE];
        invoices.value = results?.data?.items || [];
      }
    } catch (error) {
      console.error("Invoice search error:", error);
      invoices.value = [];
    } finally {
      isLoadingInvoices.value = false;
    }
  } else {
    invoices.value = [];
  }
}, 300);

function handleSearch(e: Event) {
  const target = e.target as HTMLInputElement;
  currentSearchValue.value = target.value;
  debouncedSearch(target.value);
  debouncedMatterSearch(target.value);
  debouncedClientSearch(target.value);
  debouncedProjectSearch(target.value);
  debouncedInvoiceSearch(target.value);
}

function viewAll() {
  const baseUrl =
    "https://zumesoft.sharepoint.com/sites/AndreyevServer/Shared%20Documents/Forms/AllItems.aspx?view=7&q=";
  window.open(baseUrl + currentSearchValue.value, "_blank");
}

const currentSearchValue = ref("");

const filteredAllLinks = computed(() => {
  const allLinks = [...allUserLinks, ...allAdminLinks];
  return allLinks
    .map((group) => ({
      ...group,
      links: group.links.filter(
        (link) =>
          link.title
            ?.toLowerCase()
            .includes(currentSearchValue.value.toLowerCase()) ||
          group.group
            ?.toLowerCase()
            .includes(currentSearchValue.value.toLowerCase())
      )
    }))
    .filter((group) => group.links.length > 0);
});

interface NavLink {
  title: string;
  icon: string;
  variant: string;
  routerName: string;
  permission?: string;
}

function handleSelectSearchResult(result: SearchResult) {
  if (result?.path) {
    window.open(result.path, "_blank");
  }
}

function handleSelectLink(item: NavLink) {
  if (item.routerName) {
    router.push({ name: item.routerName });
  }
}

function showMoreResults() {
  displayLimit.value += 5;
}

function handleDialogUpdate(open: boolean) {
  if (!open) {
    searchResults.value = [];
    currentSearchValue.value = "";
    isLoading.value = false;
    displayLimit.value = 5;
  }
}

// Modify matter click handler function
function handleSelectMatter(matter: Matter) {
  router.push({ 
    name: 'Matter',  // Modify to correct route name
    params: { 
      id: matter.id 
    }
  });
  isOpen.value = false;
}

function viewAllMatters() {
  router.push({ 
    name: 'Matters',
    query: { 
      search: currentSearchValue.value
    }
  });
  isOpen.value = false;
}

// Add client click handler
function handleSelectClient(client: Client) {
  router.push({ 
    name: 'Client',
    params: { 
      id: client.id 
    }
  });
  isOpen.value = false;
}

// Add view all function
function viewAllClients() {
  router.push({ 
    name: 'Clients',
    query: { 
      search: currentSearchValue.value
    }
  });
  isOpen.value = false;
}

// Add project click handler
function handleSelectProject(project: Project) {
  router.push({ 
    name: 'Project',
    params: { 
      id: project.id 
    }
  });
  isOpen.value = false;
}

// Add view all function
function viewAllProjects() {
  router.push({ 
    name: 'Projects',
    query: { 
      search: currentSearchValue.value
    }
  });
  isOpen.value = false;
}

// Add invoice click handler
function handleSelectInvoice(invoice: Invoice) {
  router.push({ 
    name: 'Invoice',
    params: { 
      id: invoice.id 
    }
  });
  isOpen.value = false;
}

// Add view all function
function viewAllInvoices() {
  router.push({ 
    name: 'Invoices',
    query: { 
      search: currentSearchValue.value
    }
  });
  isOpen.value = false;
}

// Add keyboard shortcut handler
function handleKeyDown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    isOpen.value = true;
  }
}

// Add lifecycle hooks
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

</script>
