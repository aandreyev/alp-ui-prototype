<template>
  <div class="flex flex-col">
    <div
      class="flex flex-col px-1 pt-1 w-full border-b border-gray-300 sticky-section"
    >
      <!-- Breadcrumb -->
      <div class="flex py-1 px-3 text-gray-700" aria-label="Breadcrumb">
        <div class="inline-flex items-center space-x-1 md:space-x-3 flex-wrap">
          <span class="inline-flex items-center">
            <router-link
              class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              to="/"
            >
              <HomeIcon />
              <span class="ml-1 text-sm font-medium text-black"> Home </span>
            </router-link>
          </span>
          <span v-if="backLink">
            <div class="flex items-center">
              <ChevronRightIcon />
              <router-link
                class="ml-1 text-sm font-medium text-gray-700 hover:text-gray-900 md:ml-2 dark:text-gray-400 dark:hover:text-white"
                :to="backLink.link"
              >
                <a href="#" class="">{{ backLink.name }}</a>
              </router-link>
            </div>
          </span>
          <span aria-current="page">
            <div class="flex items-center">
              <ChevronRightIcon />

              <template class="text-left" v-for="link in links">
                <router-link
                  v-if="canAll(link.permissions)"
                  :key="link.link"
                  custom
                  :to="link.link"
                  v-slot="{ isActive }"
                >
                  <span
                    class="ml-1 text-sm font-medium text-gray-400 md:ml-2 dark:text-gray-500"
                    v-if="isActive"
                    >{{ link.name }}
                  </span>
                </router-link>
              </template>
            </div>
          </span>
        </div>
      </div>

      <alp-options v-if="options">
        <span
          v-for="option in options"
          :key="option.name"
          class="px-3 py-2 text-xs cursor-pointer hover:bg-gray-100"
          @click="option.onClick"
          >{{ option.name }}</span
        >
      </alp-options>

      <!-- End Breadcrumb -->

      <slot />


      <!--Tabs with icons -->

      <div>
        <ul
          class="flex flex-wrap header-tabs -mb-px text-sm font-semibold text-center text-gray-500 dark:text-gray-400 list-none"
          ref="navigation"
          id="navigation"
        >
          <template v-for="link in links">
            <router-link
              v-if="canAll(link.permissions)"
              :key="link.link"
              custom
              :to="link.link"
              v-slot="{ isActive, navigate }"
            >
              <li class="mr-3 md:mr-5">
                <a
                  href="#"
                  class="inline-flex py-1 rounded-t-lg border-b-2 group items-center md:text-sm text-xs"
                  @click="navigate"
                  :class="{
                    'border-blue-600 active dark:text-blue-500 dark:border-blue-500 text-blue-600':
                      isActive,
                    'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300':
                      !isActive
                  }"
                >
                  <font-awesome-icon
                    :icon="link.icon"
                    v-if="link.icon"
                    class="pr-2"
                  />
                  <span v-if="!state.isHideTabsName"> {{ link.name }}</span>
                </a>
              </li>
            </router-link>
          </template>
        </ul>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { useCan } from "@/composable/can";
import { defineComponent, PropType, reactive } from "vue";
import { HomeIcon, ChevronRightIcon } from "@radix-icons/vue";

export default defineComponent({
  props: {
    backLink: {
      type: Object
    },
    options: {
      type: Array as PropType<{ name: string; onClick: () => void }[]>
    },
    links: {
      type: Array as PropType<
        {
          link: string;
          name: string;
          permissions: string[];
          icon: string;
        }[]
      >,
      required: true
    },
    firstName: {
      type: String,
      default: null
    },
    lastName: {
      type: String,
      default: null
    }
  },
  components: {
    HomeIcon,
    ChevronRightIcon
  },
  setup() {
    const { canAll } = useCan();
    const navigation = document.getElementById("navigation");
    const state = reactive({
      isHideTabsName: false,
      currentScreenSize: 0
    });
    return { canAll, state, navigation };
  },
  methods: {
    windowResize() {
      if (this.navigation != null) {
        let height = this.navigation.clientHeight;
        if (height >= 110) {
          if (this.isScreenSizeDecreasing()) this.state.isHideTabsName = true;
        } else {
          if (!this.isScreenSizeDecreasing()) this.state.isHideTabsName = false;
        }
        this.state.currentScreenSize = window.innerWidth;
      }
    },
    isScreenSizeDecreasing() {
      return this.state.currentScreenSize > window.innerWidth;
    }
  },
  mounted() {
    this.windowResize();
    this.state.currentScreenSize = window.innerWidth;
    window.addEventListener("resize", this.windowResize);
  }
});
</script>

<style scoped>
.sticky-section {
  position: sticky;
  top: 0;
  z-index: 9;
}
@media screen and (max-width: 1100px) {
  .sticky-section {
    position: inherit;
  }
}
</style>
