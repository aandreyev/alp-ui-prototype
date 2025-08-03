<template>
  <div
    class="flex-1 inline-block min-h-0 min-w-0 overflow-y-auto overflow-x-auto"
    ref="container"
  >
    <div class="h-full flex-1 flex-col space-y-4 md:flex relative">
      <div class="flex items-center justify-between space-y-2">
        <div>
          <div class="flex items-center justify-between space-y-2">
            <p class="text-muted-foreground text-xs">
              {{ listCount }} project time entries in search result
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <div class="flex items-center space-x-2">
            <shad-button size="sm" @click="showCreateEntryModal">
              <font-awesome-icon icon="fa-solid fa-plus" class="mr-2" />
              Add a project time entry
            </shad-button>
          </div>
        </div>
      </div>
      <shad-data-table
        className="time-entries"
        :columns="columns"
        :data="items"
        :count="listCount"
        :searchValue="state.search"
        searchPlaceholder="Search time entires..."
        :columnFilter="columnFilterValues"
        @selected-row="$emit('selected', $event)"
        @load-more="loadMore"
        @selected-row-page="rowListBySize"
        @search="debouncedSearch"
        @selected-status="fetchStatus"
      >
        <template v-slot:datatablefilter>
          <OwnerFilter
            v-model="state.user"
            :placeholder="state.user.fullName"
            :resetFilter="state.resetFilter"
            :canClear="true"
            @selected="selectFilter"
          />
          <DateRangePicker
            :resetFilter="state.resetFilter"
            @selected-range="fetchRangeValues"
            :show-all-range="true"
          />
        </template>

        <template v-slot:projectTask.name="{ row }">
          <router-link
            :to="{
              name: 'Project Task',
              params: {
                id: row.projectTask.project.id,
                taskId: row.projectTask.id
              }
            }"
            target="_blank"
            class="flex hover:text-blue-600 cursor-pointer"
            @click.stop=""
          >
            <div class="flex items-center">
              <span>
                {{ row.projectTask.name }}
              </span>
              <font-awesome-icon
                icon="fa-solid fa-arrow-up-right-from-square"
                class="flex px-2"
              />
            </div>
          </router-link>
        </template>

        <template v-slot:date="{ row }">
          {{ fmtToLocalShortDate(row.date) }}
        </template>
        <template v-slot:value="{ row }">
          {{ fmtCurrency((row.rate * row.units) / 10) }}
        </template>
      </shad-data-table>
    </div>
    <div ref="sentinel" />
  </div>
</template>

<script setup lang="ts">
import { fmtToLocalShortDate, toDateTime } from "@/composable/date";
import { useInfiniteListable } from "@/composable/infinite-list";
import { TimeEntryStore } from "@/store/modules/time-entries";
import { computed, getCurrentInstance, h, reactive, watch } from "vue";
import { useStore } from "vuex";
import { DataTableStore } from "@/store/modules/datatable";
import { useEnum } from "@/composable/enum";
import { debounce } from "lodash";
import { ApiStore } from "@/store/utils";
import { ColumnDef } from "@tanstack/vue-table";
import DataTableColumnHeader from "@/components/common/layout/DataTable/DataTableColumnHeader.vue";
import { fmtCurrency } from "@/composable/currency";
import DateRangePicker from "@/lib/registry/new-york/ui/date-range-picker/DateRangePicker.vue";
import OwnerFilter from "@/components/inputs/filters/OwnerFilter.vue";
import { UserStore } from "@/store/modules/users";
import { DataTableFilterState } from "@/store/dataTableState";
// import CreateProjectTimeEntry from "@/components/modals/time-entry/CreateProjectTimeEntry.vue";
import { ModalStore, ModalType } from "@/store/modules/modals";
import {
  TimeEntryDtoPaginatedDto,
  TimeEntryDto
} from "@/network/dtos/time-entry-dto";
import { UserListDto, CurrentUserDto } from "@/network/dtos/user-dto";

const props = defineProps<{
  id: number;
}>();
const state = reactive({
  search: "",
  user: new UserListDto(),
  resetFilter: false,
  startDate: Date,
  endDate: Date
});
const emit = defineEmits(["selected", "click", "selected-range", "user"]);
const currentUser = computed<CurrentUserDto>(
  () => store.getters[UserStore.getters.GET_ME]
);
const { items, loading, fetch, reset } = useInfiniteListable({
  items: TimeEntryStore.getters.GET_PROJECT_TIME_ENTRIES_FOR_PROJECT,
  query: TimeEntryStore.actions.GET_PROJECT_TIME_ENTRIES_FOR_PROJECT,
  queryParams: () => ({
    projectId: props.id,
    search: state.search,
    startDate: state.startDate,
    endDate: state.endDate,
    userId: state.user?.id
  })
});

watch(
  [
    () => state.search,
    () => state.startDate,
    () => state.endDate,
    () => state.user
  ],
  () => {
    reset();
    if (state.user) {
      emit("user", state.user);
    }
  },
  { immediate: true, deep: true }
);

// function loadMore() {
//   if (loading.value) {
//     return;
//   }
//   fetch();
// }
// const { container, sentinel } = useInfiniteTrigger(loadMore);
const store = useStore();
store.commit(
  DataTableStore.mutations.SET_FILTER_DATATABLE_STATE,
  "projectTimeEntriesForProjectDataTable"
);
enum ColumnFilter {
  ProjectTask = 0,
  Description = 1,
  Date = 2,
  Units = 3,
  User = 4
}

const { toDropdownOptions: toColumnOptions } = useEnum(ColumnFilter);
const columnFilter = toColumnOptions();
const columnFilterValues = columnFilter.map((element) => ({
  value: element.value,
  label: element.key,
  isChecked: true
}));
const instance = getCurrentInstance();
const debounceDelay =
  instance?.appContext.config.globalProperties.$debounceDelay;
const debouncedSearch = debounce((query) => {
  searchFilter(query);
}, debounceDelay);

function searchFilter(searchValue: string) {
  state.search = searchValue;
}
function storeUpdate(limit: number, sort: any, header: any) {
  store.dispatch(TimeEntryStore.actions.GET_PROJECT_TIME_ENTRIES_FOR_PROJECT, {
    projectId: props.id,
    search: state.search,
    startDate: state.startDate,
    endDate: state.endDate,
    userId: state.user?.id || undefined,
    limit: limit,
    offset: offset,
    header:
      header == ""
        ? store.getters[DataTableStore.getters.GET_SORTING_HEADER]
        : header
  });
}
function limitOffsetUpdate(limit: number, offset: number) {
  store.commit(DataTableStore.mutations.SET_LIMIT, limit);
  store.commit(DataTableStore.mutations.SET_OFFSET, offset);
}
function rowListBySize(pageSize: any) {
  limitOffsetUpdate(pageSize, offset);
  storeUpdate(pageSize, "", "");
}
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

const listCount = computed(
  () =>
    ApiStore.toData<TimeEntryDtoPaginatedDto>(
      store.getters[TimeEntryStore.actions.GET_PROJECT_TIME_ENTRIES_FOR_PROJECT]
    )?.count || 0
);

function sortingList(sort: any, header: any) {
  store.dispatch(TimeEntryStore.actions.GET_PROJECT_TIME_ENTRIES_FOR_PROJECT, {
    projectId: props.id,
    search: state.search,
    startDate: state.startDate,
    endDate: state.endDate,
    userId: state.user?.id || undefined,
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

const columns: ColumnDef<TimeEntryDto>[] = [
  {
    accessorKey: "projectTask.name",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Project Task" })
  },
  {
    accessorKey: "description",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Description" }),
    cell: ({ row }) => {
      return h("div", { class: "flex space-x-2" }, [
        h(
          "span",
          {
            class: "max-w-[500px] truncate font-medium",
            title: row.getValue("description")
          },
          row.getValue("description")
        )
      ]);
    }
  },
  {
    accessorKey: "date",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Date" })
  },
  {
    accessorKey: "units",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Units" }),
    cell: ({ row }) => {
      return h("div", [
        h("span", { class: "truncate font-medium" }, row.getValue("units"))
      ]);
    }
  },
  {
    accessorKey: "user.fullName",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "User" })
  }
];

interface DateRange {
  start: Date;
  end: Date;
}
function fetchRangeValues(range: DateRange) {
  if (range && range.start && range.end) {
    state.startDate = toDateTime(range.start)?.toLocal();
    state.endDate = toDateTime(range.end)?.toLocal();
    if (
      new Date(range.start).setHours(0, 0, 0, 0) !=
        new Date().setHours(0, 0, 0, 0) ||
      new Date(range.end).setHours(23, 59, 59, 999) !=
        new Date().setHours(23, 59, 59, 999)
    ) {
      selectFilter(1);
    }
  }
  emit("selected-range", range);
}
let datatableState = new DataTableFilterState();

function fetchStatus(value: any, search: any) {
  state.resetFilter = true;
  store.commit(DataTableStore.mutations.SET_EXTRA_FILTER, value);
  datatableState.setItem(
    store.getters[DataTableStore.getters.GET_FILTER_DATATABLE_STATE],
    value
  );
}
store.commit(DataTableStore.mutations.SET_EXTRA_FILTER, 0);
datatableState.setItem(
  store.getters[DataTableStore.getters.GET_FILTER_DATATABLE_STATE],
  0
);
function selectFilter(value: any) {
  state.resetFilter = false;

  store.commit(DataTableStore.mutations.SET_EXTRA_FILTER, value);
  datatableState.setItem(
    store.getters[DataTableStore.getters.GET_FILTER_DATATABLE_STATE],
    value
  );
}

const currentfetchUser = computed<CurrentUserDto>(
  () => store.getters[UserStore.getters.GET_ME]
);

function showCreateEntryModal() {
  store.dispatch(ModalStore.actions.SHOW_MODAL, {
    modal: ModalType.CreateTimeEntry,
    props: {
      modalOpen: store.commit(ModalStore.mutations.SET_MODAL_VALUE, true),
      defaultSelectedTab: "project",
      startDate: state.startDate,
      endDate: state.endDate,
      user:
        currentfetchUser.value == state.user ? currentfetchUser : state.user,
      projectId: props.id
    }
  });
}
</script>
