<template>
  <slide-over heading="Time Entry Selector" @close="$emit('close')">
    <!-- <div class="py-2 ml-8 inset-y-0 right-0"></div> -->
    <table-layout-container>
      <div class="flex items-center justify-between space-y-2">
        <div>
          <h2 class="text-2xl font-bold tracking-tight">Time Entries</h2>
          <div class="flex items-center justify-between space-y-2">
            <p class="text-muted-foreground text-xs">
              {{ listCount }} time entries in search result
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <shad-button
            variant="outline"
            v-if="
              invoice?.status == InvoiceStatus.Draft ||
              invoice?.status == InvoiceStatus.AwaitingApproval ||
              can('Invoice.Send')
            "
            @click.stop="addAllTimeEntryToInvoice"
            class="text-blue-600"
          >
            <iconify-icon icon="lucide:link" class="size-5 pr-2" />
            Assign all
          </shad-button>
        </div>
      </div>
      <shad-data-table
        :columns="columns"
        :data="items"
        :count="listCount"
        :searchValue="state.search"
        searchPlaceholder="Search time entires..."
        :columnFilter="columnFilterValues"
        @load-more="loadMore"
        @selected-row-page="rowListBySize"
        @search="debouncedSearch"
        @selected-row="selectTimeEntry"
      >
        <template v-slot:context="{ row }">
          <td class="hover:underline" @click.stop="navigateToContext(row)">
            {{ TimeEntryTypes[row.timeEntryType] }} #{{ row.entityId }}
          </td>
        </template>
        <template v-slot:date="{ row }">
          <td>
            {{ fmtToLocalShortDate(row.date) }}
          </td>
        </template>
      </shad-data-table>
    </table-layout-container>
  </slide-over>
</template>

<script setup lang="ts">
import SlideOver from "@/components/ui/layout/SlideOver.vue";
import { fmtToLocalShortDate } from "@/composable/date";
import {
  useInfiniteListable,
  useInfiniteTrigger
} from "@/composable/infinite-list";
import { InvoiceStore } from "@/store/modules/invoices";
import { ColumnDef } from "@tanstack/vue-table";
import {
  computed,
  defineComponent,
  getCurrentInstance,
  h,
  reactive,
  watch
} from "vue";
import { useStore } from "vuex";
import DataTableColumnHeader from "@/components/common/layout/DataTable/DataTableColumnHeader.vue";
import { DataTableStore } from "@/store/modules/datatable";
import { useEnum } from "@/composable/enum";
import { ApiStore } from "@/store/utils";
import { debounce } from "lodash";
import { useCan } from "@/composable/can";
import { InvoiceDto } from "@/network/dtos/invoice-dto";
import {
  TimeEntryDto,
  TimeEntryDtoPaginatedDto
} from "@/network/dtos/time-entry-dto";
import { BillableTypes,GstTypes,InvoiceStatus,TimeEntryTypes } from "@/network/dtos/enumTypes";

const { can } = useCan();
const props = defineProps<{
  id: number;
}>();
const state = reactive({
  search: ""
});

const store = useStore();

const { items, loading, fetch, reset } = useInfiniteListable({
  items: InvoiceStore.getters.GET_AVAILABLE_INVOICE_TIME_ENTRIES,
  query: InvoiceStore.actions.GET_AVAILABLE_INVOICE_TIME_ENTRIES,
  queryParams: () => ({
    search: state.search,
    id: props.id
  })
});
watch([() => state.search], reset);

const invoice = computed(() =>
  ApiStore.toData<InvoiceDto>(
    store.getters[InvoiceStore.getters.GET_INVOICE](props.id)
  )
);

function selectTimeEntry(entry: TimeEntryDto) {
  store.dispatch(InvoiceStore.actions.ADD_INVOICE_TIME_ENTRIES, {
    id: props.id,
    timeEntryId: entry.id
  });
}

function addAllTimeEntryToInvoice() {
  store.dispatch(InvoiceStore.actions.ADD_ALL_TIME_ENTRIES_TO_INVOICE, {
    id: props.id
  });
}

store.commit(
  DataTableStore.mutations.SET_DATATABLE_STATE,
  "invoiceTimeEntriesSelectorDataTable"
);

const instance = getCurrentInstance();
const debounceDelay =
  instance?.appContext.config.globalProperties.$debounceDelay;
const debouncedSearch = debounce((query) => {
  searchFilter(query);
}, debounceDelay);

function searchFilter(searchValue: string) {
  state.search = searchValue;
}
enum ColumnFilter {
  Id = 0,
  Staff = 1,
  Description = 2,
  Date = 3,
  Units = 4,
  Rate = 5
}

const { toDropdownOptions: toColumnOptions } = useEnum(ColumnFilter);
const columnFilter = toColumnOptions();
const columnFilterValues = columnFilter.map((element) => ({
  value: element.value,
  label: element.key,
  isChecked: true
}));
function storeUpdate(limit: number, sort: any, header: any) {
  store.dispatch(InvoiceStore.actions.GET_AVAILABLE_INVOICE_TIME_ENTRIES, {
    search: state.search,
    id: props.id,
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
      store.getters[InvoiceStore.actions.GET_AVAILABLE_INVOICE_TIME_ENTRIES]
    )?.count || 0
);
const columns: ColumnDef<TimeEntryDtoPaginatedDto>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Id" }),
    cell: ({ row }) => h("div", { class: "w-[80px]" }, row.getValue("id")),
    enableSorting: false
  },
  {
    accessorKey: "user.fullName",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Staff" })
  },
  {
    accessorKey: "description",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Description" })
  },
  {
    accessorKey: "date",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Date" })
  },
  {
    accessorKey: "units",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Units" })
  },
  {
    accessorKey: "rate",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Rate" })
  }
];
</script>
