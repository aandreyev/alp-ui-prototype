<template>
  <div
    class="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-auto"
    ref="container"
  >
    <transition-group name="list-complete">
      <inline-matter-trust-request
        class="mb-3 transition duration-200 m-2"
        v-for="item in items"
        :key="item.id"
        :trust="item"
        @load-more="fetch"
      />
    </transition-group>
    <div ref="sentinel" />
  </div>
</template>

<script lang="ts">
import { fmtCurrency } from "@/composable/currency";
import { fmtToLocalShortDate } from "@/composable/date";
import { useInfiniteListable } from "@/composable/infinite-list";
import { TrustStore } from "@/store/modules/trust";
import InlineMatterTrustRequest from "@/components/ui/matters/InlineMatterTrustRequest.vue";
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  components: {
    InlineMatterTrustRequest
  },
  setup(props) {
    const { items, loading, fetch, reset } = useInfiniteListable({
      items: TrustStore.getters.GET_MATTER_TRUST_REQUESTS,
      query: TrustStore.actions.GET_MATTER_TRUST_REQUESTS,
      queryParams: () => ({
        id: props.id
      })
    });

    return {
      fmtToLocalShortDate,
      fmtCurrency,
      items,
      loading,
      fetch
    };
  }
});
</script>
