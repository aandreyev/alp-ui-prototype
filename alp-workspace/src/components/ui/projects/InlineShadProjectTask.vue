<template>
  <div class="h-full flex-1 flex-col p-2 md:flex relative">
    <div class="flex items-center justify-between space-y-2">
      <div>
        <!-- <h2 class="text-2xl font-bold tracking-tight">Project Tasks</h2> -->
        <div class="flex items-center justify-between space-y-2">
          <p class="text-muted-foreground text-xs">
            {{ listCount }} project tasks in search result
          </p>
        </div>
      </div>
    </div>
    <shad-data-table
      :columns="columns"
      :data="items"
      :count="listCount"
      :searchValue="state.search"
      searchPlaceholder="Search tasks..."
      :columnFilter="columnFilterValues"
      :multiselectfilter="true"
      @load-more="loadMore"
      @selected-row-page="rowListBySize"
      @search="debouncedSearch"
      :filterTitle="filterTitle"
      :filterOptions="statusValues"
      filterColumnName="status"
      @selected-status="fetchStatus"
      @selected-row="rowClick"
    >
      <template v-slot:datatablefilter>
        <AssigneeFilter
          :showOwner="true"
          v-model="state.filters.userId"
          :resetFilter="state.resetFilter"
          @selected="selectFilter"
        />
      </template>
      <template v-slot:timer="{ row }">
        <transition name="fade-fast" mode="out-in">
          <inline-timer
            v-if="activeTimer(row.id) != undefined"
            :timer="activeTimer(row.id)"
            :projectId="row.project.id"
            :projectTaskId="row.id"
            :filters="state.filters"
          />
          <span v-else class="w-full flex justify-center">
            <alp-button
              class="flex"
              variant="success"
              @click.stop="startTimer(row.id)"
            >
              <font-awesome-icon icon="fa-solid fa-play" />
            </alp-button>
          </span>
        </transition>
      </template>
      <template v-slot:assignee="{ row }">
        <ShadMultiUserSelector
          class="w-full"
          :value="row.assigned"
          @selected="addTeamMember($event, row.id, row.project.id)"
          @removed="removeTeamMember($event, row.id, row.project.id)"
          @click.stop=""
        />
      </template>

      <template v-slot:units="{ row }">
        {{ row.totalUnits }} / {{ row.estimatedTime }} units
      </template>
      <template v-slot:duedate="{ row }">
        {{ fmtToLocalShortDate(row.dueDate) }}
      </template>
      <template v-slot:action="{ row }">
        <shad-dropdown-menu>
          <shad-dropdown-menu-trigger as-child>
            <shad-button
              variant="ghost"
              class="flex h-8 w-8 p-0 data-[state=open]:bg-muted !border-0"
              @click.stop=""
            >
              <DotsHorizontalIcon class="h-4 w-4" />
            </shad-button>
          </shad-dropdown-menu-trigger>
          <shad-dropdown-menu-content align="end" class="w-[160px]">
            <shad-dropdown-menu-item
              @click.stop="
                $router.push({
                  name: 'Project Task',
                  params: { id: row.project.id, taskId: row.id }
                })
              "
              >Edit</shad-dropdown-menu-item
            >
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup :value="ProjectTaskStatus">
                  <DropdownMenuRadioItem
                    v-for="label in projectTasksStatus"
                    :key="label.key"
                    :value="label.value"
                    @click="handleStatusChange(label.value, row)"
                  >
                    <CheckIcon
                      v-if="label.value == row.status"
                      class="size-6 absolute left-0"
                    />
                    {{ label.key }}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <shad-dropdown-menu-item
              @click="showDeleteWarning(row.id, row.project.id)"
              ><span class="text-red-600 font-semibold"
                >Delete</span
              ></shad-dropdown-menu-item
            >
          </shad-dropdown-menu-content>
        </shad-dropdown-menu>
      </template>
    </shad-data-table>
  </div>
  <router-view v-slot="{ Component }">
    <transition name="slide-over" mode="out-in">
      <component
        :is="Component"
        :key="$route.params.taskId"
        @close="$router.push({ name: 'Project TasksList' })"
        @step-updated=""
      />
    </transition>
  </router-view>

  <deletion-warning
    class="z-40"
    :showDeleteDialog="state.showDeletionWarning"
    @cancel="state.showDeletionWarning = false"
    @delete="deleteProjectTask"
  />
</template>

<script setup lang="ts">
import {
  computed,
  getCurrentInstance,
  h,
  onMounted,
  reactive,
  ref,
  watch
} from "vue";
import { useStore } from "vuex";

import { useInfiniteListable } from "@/composable/infinite-list";
import { ProjectStore } from "@/store/modules/projects";
import { FilterState, enumFilterState } from "@/store/filterState";
import { DataTableStore } from "@/store/modules/datatable";
import { ApiStore } from "@/store/utils";
import { ColumnDef } from "@tanstack/vue-table";
import DataTableColumnHeader from "@/components/common/layout/DataTable/DataTableColumnHeader.vue";

import { debounce } from "lodash";
import { useEnum } from "@/composable/enum";
import { DataTableFilterState } from "@/store/dataTableState";
import AssigneeFilter from "@/components/inputs/filters/AssigneeFilter.vue";
import { DotsHorizontalIcon } from "@radix-icons/vue";
import { useNotify } from "@/composable/notify";
import { fmtToLocalShortDate } from "@/composable/date";
import { useRouter } from "vue-router";
import { CheckCircledIcon } from "@radix-icons/vue";
import { CircleIcon } from "@radix-icons/vue";
import { QuestionMarkCircledIcon } from "@radix-icons/vue";
import { StopwatchIcon } from "@radix-icons/vue";
import { router } from "@/router";
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from "@/lib/registry/new-york/ui/dropdown-menu";
import { CheckIcon } from "@radix-icons/vue";
import { TimeEntryStore } from "@/store/modules/time-entries";
import InlineTimer from "@/components/common/InlineTimer.vue";
import { UserStore } from "@/store/modules/users";
import ShadMultiUserSelector from "@/components/inputs/selectors/ShadMultiUserSelector.vue";
import DeletionWarning from "@/components/modals/warning/DeletionWarning.vue";
import { ProjectTaskStatus, TimerType } from "@/network/dtos/enumTypes";
import {
  ProjectTaskFilter,
  ProjectTasksDtoPaginatedDto,
  ProjectTaskDto
} from "@/network/dtos/project-dto";
import { CreateTimerInput } from "@/network/dtos/timer-dto";
import { UserListDto } from "@/network/dtos/user-dto";

const props = defineProps({
  projectId: Number,
  showCompleted: Boolean,
  showAssignedToMe: Boolean
});
const sprintRange = ref({});
const store = useStore();
// Status Dropdown
const filterTitle = "Status";
const { toDropdownOptions: toProjectTaskStatusOptions } =
  useEnum(ProjectTaskStatus);
const projectTaskStatus = toProjectTaskStatusOptions();
const statusValues = projectTaskStatus.map((element) => ({
  value: element.value,
  label: element.key,
  icon: "",
  isChecked: element.key === "Available"
}));
const { fireConfirm, fireSuccessToast } = useNotify();
let datatableState = new DataTableFilterState();
function fetchStatus(value: any) {
  // filter region
  if (value == 0) {
    state.filters.userId = 0;
    state.resetFilter = true;
    setStoreValue(0);
  }
  state.status = value == null ? [] : value;
  // status region
  store.commit(
    DataTableStore.mutations.SET_FILTER_STATUS,
    value == null ? [] : value
  );
  datatableState.setItem(
    store.getters[DataTableStore.getters.GET_DATATABLE_STATE],
    value == null ? [] : value
  );
}

let filterState = new FilterState();
const filterStateData = GetFilterState();
function GetFilterState() {
  let filterData = filterState.getItem(enumFilterState.ProjectTasksList);
  if (filterData) return filterData;
  return {
    search: "",
    status: []
  };
}
function SetFilterState() {
  let filterStateData = {
    search: state.search,
    status: state.status
  };
  filterState.setItem(enumFilterState.ProjectTasksList, filterStateData);
}
// filters
let filters = new ProjectTaskFilter();
filters.projectId = props.projectId;
filters.showAssignedToMe = props.showAssignedToMe;
filters.showCompleted = props.showCompleted;
const state = reactive({
  search: "",
  filters: filters,
  resetFilter: false,
  updateRowName: "",
  updateRowId: 0,
  updateRowProjectId: 0,
  status: filterStateData.status,
  resetSprintFilter: false,
  showDeletionWarning: false,
  choosenProjectId: 0,
  choosenProjectTaskId: 0,
  limit: 50,
  offset: 0
});

async function fetchCurrentUser() {
  await store.dispatch(UserStore.actions.GET_ME);
}

onMounted(async () => await fetchCurrentUser());
// state.filters.userId = computed<number>(
//   () => store.getters[UserStore.getters.GET_ME].id
// );
const { items, loading, fetch, reset } = useInfiniteListable({
  items: ProjectStore.getters.GET_PROJECTS_TASKS_LIST,
  query: ProjectStore.actions.GET_PROJECTS_TASKS_LIST,
  queryParams: () => ({
    projectId: 0,
    search: state.search,
    filters: state.filters,
    status: state.status
  })
});

watch(
  [
    () => state.search,
    () => state.filters.userId,
    () => state.status,
    () => state.filters.projectId,
    () => state.filters.startDate,
    () => state.filters.endDate,
    () => state.filters.sprintId,
    () => props.showAssignedToMe,
    () => props.showCompleted
  ],
  () => {
    filters.showAssignedToMe = props.showAssignedToMe;
    filters.showCompleted = props.showCompleted;
    filters.projectId = props.projectId;
    SetFilterState();
    fetch();
    reset();
  }
);

function fetchSprintRange(event: any) {
  sprintRange.value = { startDate: event.startDate, endDate: event.endDate };
}

const routers = useRouter();
const currentRouteName = computed(() => routers.currentRoute.value.fullPath);
watch(
  [() => currentRouteName],
  () => {
    if (Object.keys(filterStateData).length == 0) {
      store.commit(DataTableStore.mutations.SET_FILTER_STATUS, 0);
      store.commit(
        DataTableStore.mutations.SET_DATATABLE_STATE,
        "inlineProjectTaskDataTable"
      );
      datatableState.setItem(
        store.getters[DataTableStore.getters.GET_DATATABLE_STATE],
        0
      );
    }
  },
  { deep: true, immediate: true }
);
// Datatable
store.commit(
  DataTableStore.mutations.SET_DATATABLE_STATE,
  "inlineProjectTaskDataTable"
);
store.commit(
  DataTableStore.mutations.SET_FILTER_DATATABLE_STATE,
  "inlineProjectTaskFilterDataTable"
);

enum ColumnFilter {
  Id = 0,
  Task = 1,
  Timer = 2,
  Assignee = 3,
  Units = 4,
  Status = 5,
  DueDate = 6
}

const { toDropdownOptions: toColumnOptions } = useEnum(ColumnFilter);
const columnFilter = toColumnOptions();
const columnFilterValues = columnFilter.map((element) => ({
  value: element.value,
  label: element.key,
  isChecked: true
}));
const { toDropdownOptions: toProjectTaskStatus } = useEnum(ProjectTaskStatus);
const projectTasksStatus = toProjectTaskStatus();

const instance = getCurrentInstance();
const debounceDelay =
  instance?.appContext.config.globalProperties.$debounceDelay;
const debouncedSearch = debounce((query) => {
  searchFilter(query);
}, debounceDelay);

function searchFilter(searchValue: string) {
  state.search = searchValue;
}
const listCount = computed(
  () =>
    ApiStore.toData<ProjectTasksDtoPaginatedDto>(
      store.getters[ProjectStore.actions.GET_PROJECTS_TASKS_LIST]
    )?.count || 0
);

let offset = 0;
let limit = 50;
function loadMore(pagenumber: any, rowlimit: any) {
  if (pagenumber != "") {
    offset = 50 * (pagenumber - 1);
  } else offset = 0;

  if (rowlimit != undefined && rowlimit != "") {
    limit = rowlimit;
    offset = rowlimit * (pagenumber - 1);
  }

  limitOffsetUpdate(limit, offset);
  storeUpdate(limit, "", "");
}
function limitOffsetUpdate(limit: number, offset: number) {
  store.commit(DataTableStore.mutations.SET_LIMIT, limit);
  store.commit(DataTableStore.mutations.SET_OFFSET, offset);
}
function storeUpdate(limit: number, sort: any, header: any) {
  store.dispatch(ProjectStore.actions.GET_PROJECTS_TASKS_LIST, {
    projectId: 0,
    status: state.status,
    filters: state.filters,
    limit: limit,
    offset: offset,
    sort:
      sort == ""
        ? store.getters[DataTableStore.getters.GET_SORTING_VALUE]
        : sort,
    header:
      header == ""
        ? store.getters[DataTableStore.getters.GET_SORTING_HEADER]
        : header
  });
}
function rowListBySize(pageSize: any) {
  limitOffsetUpdate(pageSize, offset);
  storeUpdate(pageSize, "", "");
}

function sortingList(sort: any, header: any) {
  store.dispatch(ProjectStore.actions.GET_PROJECTS_TASKS_LIST, {
    projectId: 0,
    status: state.status,
    limit: store.getters[DataTableStore.getters.GET_LIMIT],
    offset: store.getters[DataTableStore.getters.GET_OFFSET],
    sort: sort,
    header:
      header == ""
        ? store.getters[DataTableStore.getters.GET_SORTING_HEADER]
        : header
  });
}
let selectedvalue: any, selectedheader: any;
watch(
  [
    () =>
      (selectedheader =
        store.getters[DataTableStore.getters.GET_SORTING_HEADER]),
    () =>
      (selectedvalue = store.getters[DataTableStore.getters.GET_SORTING_VALUE])
  ],
  () => {
    if (
      selectedvalue != "" &&
      selectedvalue != undefined &&
      selectedheader != "" &&
      selectedheader != undefined
    )
      sortingList(selectedvalue, selectedheader);
  },
  { immediate: true, deep: true }
);

const columns: ColumnDef<ProjectTasksDtoPaginatedDto>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Id" }),

    enableSorting: false
  },
  // {
  //   accessorKey: "project.id",
  //   header: ({ column }) =>
  //     h(DataTableColumnHeader, { column, title: "Project #" }),

  //   enableSorting: false
  // },
  // {
  //   accessorKey: "project.name",
  //   header: ({ column }) =>
  //     h(DataTableColumnHeader, { column, title: "Project Name" }),

  //   enableSorting: false
  // },
  {
    accessorKey: "name",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Task" })
  },
  {
    accessorKey: "timer",
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column,
        title: "Timer",
        class: "justify-center ml-4"
      })
  },
  {
    accessorKey: "assignee",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Assignee" })
  },
  {
    accessorKey: "units",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Act. / Est. Units" })
  },
  {
    accessorKey: "status",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Status" }),
    cell: ({ row }) => {
      const status = row.getValue("status");
      if (status == "1") {
        return h("div", { class: "flex w-[100px] items-center" }, [
          CircleIcon &&
            h(CircleIcon, { class: "mr-2 h-4 w-4 text-muted-foreground" }),
          h("span", "ToDo")
        ]);
      } else if (status == "2") {
        return h("div", { class: "flex w-[100px] items-center" }, [
          StopwatchIcon &&
            h(StopwatchIcon, { class: "mr-2 h-4 w-4 text-muted-foreground" }),
          h("span", "Doing")
        ]);
      } else if (status == "3") {
        return h("div", { class: "flex w-[100px] items-center" }, [
          CheckCircledIcon &&
            h(CheckCircledIcon, {
              class: "mr-2 h-4 w-4 text-muted-foreground"
            }),
          h("span", "Done")
        ]);
      } else if (status == "4") {
        return h("div", { class: "flex w-[100px] items-center" }, [
          QuestionMarkCircledIcon &&
            h(QuestionMarkCircledIcon, {
              class: "mr-2 h-4 w-4 text-muted-foreground"
            }),
          h("span", "Backlog")
        ]);
      }
    }
  },
  {
    accessorKey: "duedate",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Due Date" })
  }
];
let projectOriginalState = reactive({
  ...JSON.parse(JSON.stringify(state.updateRowName))
});

function showDeleteWarning(id: number, projectId: number) {
  state.showDeletionWarning = true;
  state.choosenProjectId = projectId;
  state.choosenProjectTaskId = id;
}

function deleteProjectTask() {
  store
    .dispatch(ProjectStore.actions.DELETE_PROJECT_TASK, {
      projectId: state.choosenProjectId,
      id: state.choosenProjectTaskId
    })
    .then(() => {
      state.showDeletionWarning = false;
      state.choosenProjectId = 0;
      state.choosenProjectTaskId = 0;
    });
  reset();
}

function rowClick(value: any) {
  const id = value.project.id;
  if (routers.currentRoute.value.fullPath.includes("routines")) {
    router.push({
      name: "Project Routine Task",
      params: { id, taskId: value.id }
    });
  } else {
    router.push({
      name: "Project Task",
      params: { id, taskId: value.id }
    });
  }
}
let updateRow: any;
function updateTask() {
  let tempItems = items.value as ProjectTaskDto[];
  tempItems = tempItems.filter((x) => x.id == state.updateRowId);
  store
    .dispatch(ProjectStore.actions.PATCH_PROJECT_TASK, {
      projectId: state.updateRowProjectId,
      id: state.updateRowId,
      original: projectOriginalState,
      updated: updateRow
    })
    .then(() => {
      fireSuccessToast("Updated!");
    });
}
function getProjectTasksStatus(newStatus: number): number {
  let tasks =
    ApiStore.toData<ProjectTaskDto[]>(
      store.getters[ProjectStore.getters.GET_PROJECT_TASKS](
        state.updateRowProjectId
      )
    ) || [];
  return tasks.filter((x) => x.status === newStatus).length;
}
function handleStatusChange(value: any, row: any) {
  updateRow = row;
  state.updateRowId = row.id;
  state.updateRowProjectId = row.project.id;
  updateRow.status = value;
  if (updateRow.status === ProjectTaskStatus.Done) updateRow.complete = true;
  else if (
    updateRow.status !== ProjectTaskStatus.Done &&
    updateRow.complete === true
  )
    updateRow.complete = false;
  updateRow.order = getProjectTasksStatus(updateRow.status ?? 0);
  updateTask();
}
function activeTimer(id: any) {
  const activeTimer = store.getters[TimeEntryStore.getters.GET_TIMER_FOR_TYPE](
    TimerType.ProjectTask,
    id
  );
  if (activeTimer != undefined) return activeTimer;
}
function startTimer(id: any) {
  store
    .dispatch(
      TimeEntryStore.actions.CREATE_TIMER,
      new CreateTimerInput({
        type: TimerType.ProjectTask,
        entityId: id
      })
    )
    .then();
}
function addTeamMember(user: UserListDto, id: any, projectId: any) {
  store
    .dispatch(ProjectStore.actions.ADD_PROJECT_TASK_TEAM_MEMBER, {
      projectId: projectId,
      id: id,
      userId: user.id
    })
    .then(() => {
      reset();
    });
}

function removeTeamMember(user: UserListDto, id: any, projectId: any) {
  store
    .dispatch(ProjectStore.actions.REMOVE_PROJECT_TASK_TEAM_MEMBER, {
      projectId: projectId,
      id: id,
      userId: user.id
    })
    .then(() => {
      reset();
    });
}
function fetchSprintSelection(val: boolean) {
  if (!val) {
    state.filters.sprintId = 0;
  }
}
function setStoreValue(value: any) {
  store.commit(DataTableStore.mutations.SET_EXTRA_FILTER, value);
  datatableState.setItem(
    store.getters[DataTableStore.getters.GET_FILTER_DATATABLE_STATE],
    value
  );
}
function selectFilter(value: any) {
  if (value == 0 && state.filters.userId == 0) {
    state.resetFilter = true;
    setStoreValue(0);
    return;
  }

  // when item is selected in filter then reset button come
  if (value) {
    state.resetFilter = false;
    setStoreValue(value);
  }
}
</script>
