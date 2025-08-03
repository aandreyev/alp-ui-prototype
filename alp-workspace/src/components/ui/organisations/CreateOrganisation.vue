<template>
  <shad-modal-form
    modalTitle="Create Organisation"
    :closeModal="state.closeModel"
    @closeModel="closeDialog"
    @submitValue="createOrganisation"
    :isLoading="state.isLoading"
    :hideConfirmButton="state.hideConfirmButton"
  >
    <Tabs :default-value="state.selectedTab" v-model="state.selectedTab">
      <div class="mx-auto w-10 flex items-center justify-center">
        <TabsList>
          <TabsTrigger value="organisation"> Create Organisation </TabsTrigger>
          <TabsTrigger value="abn"> Create by ABN Lookup </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent class="space-y-4" value="organisation">
        <div class="flex">
          <shad-form-field v-slot="{ componentField }" name="name" class="">
            <shad-form-item class="w-full">
              <shad-form-label :isRequired="true">Name</shad-form-label>
              <shad-form-control>
                <shad-input
                  type="text"
                  placeholder="Name"
                  v-bind="componentField"
                />
              </shad-form-control>
              <shad-form-message />
            </shad-form-item>
          </shad-form-field>
        </div>
        
        <div class="flex">
          <shad-form-field v-slot="{ componentField }" name="website" class="">
            <shad-form-item class="w-1/2 mr-3">
              <shad-form-label>Website</shad-form-label>
              <shad-form-control>
                <shad-input
                  type="url"
                  placeholder="https://example.com"
                  v-bind="componentField"
                />
              </shad-form-control>
              <shad-form-message />
            </shad-form-item>
          </shad-form-field>
        </div>
        <div class="flex">
          <shad-form-field v-slot="{ componentField }" name="estimatedRevenue">
            <shad-form-item class="w-1/2 mr-3">
              <shad-form-label :isRequired="true"
                >Estimated Revenue</shad-form-label
              >
              <shad-select v-bind="componentField" class="z-0">
                <shad-form-control>
                  <shad-select-trigger>
                    <shad-select-value placeholder="Estimated Revenue" />
                  </shad-select-trigger>
                </shad-form-control>
                <shad-select-content>
                  <shad-select-group>
                    <shad-select-label
                      >Select Estimated Revenue</shad-select-label
                    >

                    <shad-select-item :value="EstimatedRevenueType.Micro">
                      Micro ($0 - $2m)
                    </shad-select-item>
                    <shad-select-item :value="EstimatedRevenueType.Small">
                      Small (&lt; $5m)
                    </shad-select-item>
                    <shad-select-item :value="EstimatedRevenueType.Medium">
                      Medium ($5m - $50m)
                    </shad-select-item>
                    <shad-select-item :value="EstimatedRevenueType.Large"
                      >Large (&gt; $50m)</shad-select-item
                    >
                  </shad-select-group>
                </shad-select-content>
              </shad-select>

              <shad-form-message />
            </shad-form-item>
          </shad-form-field>
          <shad-form-field v-slot="{ componentField }" name="numberOfEmployees">
            <shad-form-item class="w-1/2 mr-3">
              <shad-form-label :isRequired="true"
                >Estimated Number of Employees</shad-form-label
              >
              <shad-select v-bind="componentField" class="z-0">
                <shad-form-control>
                  <shad-select-trigger>
                    <shad-select-value
                      placeholder="Estimated Number of Employees"
                    />
                  </shad-select-trigger>
                </shad-form-control>
                <shad-select-content>
                  <shad-select-group>
                    <shad-select-label
                      >Select Estimated Number of Employees</shad-select-label
                    >

                    <shad-select-item :value="NumberOfEmployeesType.Micro">
                      Micro (&lt; 5)
                    </shad-select-item>
                    <shad-select-item :value="NumberOfEmployeesType.Small">
                      Small (5 - 19)
                    </shad-select-item>
                    <shad-select-item :value="NumberOfEmployeesType.Medium">
                      Medium (20 - 199)
                    </shad-select-item>
                    <shad-select-item :value="NumberOfEmployeesType.Large">
                      Large (&gt; 200)</shad-select-item
                    >
                  </shad-select-group>
                </shad-select-content>
              </shad-select>

              <shad-form-message />
            </shad-form-item>
          </shad-form-field>
        </div>
        
        <shad-form-field v-slot="{ componentField }" name="phoneNumbers">
          <shad-form-item class="w-full">
            <shad-form-label>Phone Numbers</shad-form-label>
            <shad-form-control>
              <div class="space-y-2">
                <div
                  v-for="(phone, index) in state.phoneNumbers"
                  :key="index"
                  class="grid grid-cols-[1fr_auto_auto] items-center gap-2"
                >
                  <ContactPhoneInput
                    @update="updatePhoneNumber(index, $event)"
                    :is-valid="phone.isValid && !phone.isDuplicate"
                  />

                  <shad-select v-model="phone.label" class="w-[100px]">
                    <shad-form-control>
                      <shad-select-trigger>
                        <shad-select-value>
                          {{
                            phoneLabels.find(
                              (l) => Number(l.value) === Number(phone.label)
                            )?.key || "Select Label"
                          }}
                        </shad-select-value>
                      </shad-select-trigger>
                    </shad-form-control>
                    <shad-select-content>
                      <shad-select-group>
                        <shad-select-label>Select Label</shad-select-label>
                        <shad-select-item
                          v-for="label in phoneLabels"
                          :key="label.value"
                          :value="Number(label.value)"
                        >
                          {{ label.key }}
                        </shad-select-item>
                      </shad-select-group>
                    </shad-select-content>
                  </shad-select>

                  <shad-button
                    variant="destructive"
                    size="icon"
                    type="button"
                    @click="removePhoneNumber(index)"
                    v-if="state.phoneNumbers.length > 1"
                  >
                    <Trash2Icon class="h-4 w-4" />
                  </shad-button>
                  <span
                    v-if="state.phoneNumbers[index].errorMessage"
                    class="flex text-[0.8rem] font-medium text-destructive"
                    >{{ state.phoneNumbers[index].errorMessage }}</span
                  >
                </div>
              </div>

              <shad-button
                variant="outline"
                size="sm"
                class="mt-2"
                type="button"
                @click="addPhoneNumber"
              >
                <PlusIcon class="h-4 w-4 mr-2" />
                Add Number
              </shad-button>
            </shad-form-control>
          </shad-form-item>
        </shad-form-field>
        <div class="flex">
          <shad-form-field v-slot="{ componentField }" name="organisationType">
            <shad-form-item class="w-1/2 mr-3">
              <shad-form-label :isRequired="true"
                >Organisation Type</shad-form-label
              >
              <shad-form-control>
                <organisation-type-selector-field
                  name="organisationType"
                  v-bind="componentField"
                  @selected="updateSelector($event, 'organisationType')"
                />
              </shad-form-control>
            </shad-form-item>
          </shad-form-field>
          <shad-form-field v-slot="{ componentField }" name="industryCategory">
            <shad-form-item class="w-1/2 mr-3">
              <shad-form-label :isRequired="true"
                >Industry Category</shad-form-label
              >
              <shad-form-control>
                <industry-category-selector-field
                  name="industryCategory"
                  @selected="selectIndustryCategory"
                  v-bind="componentField"
                />
              </shad-form-control>
            </shad-form-item>
          </shad-form-field>
        </div>
        <div class="flex">
          <shad-form-field
            v-if="state.showSubIndustry"
            v-slot="{ componentField }"
            name="industrySubCategory"
          >
            <shad-form-item class="w-1/2 mr-3">
              <shad-form-label :isRequired="true"
                >Industry Sub Category</shad-form-label
              >
              <shad-form-control>
                <industry-sub-category-selector-field
                  name="industrySubCategory"
                  :industry-category-id="state.industryCategory?.id"
                  v-bind="componentField"
                  @selected="updateSelector($event, 'industrySubCategory')"
                />
              </shad-form-control>
            </shad-form-item>
          </shad-form-field>
        </div>
        <alp-form-divider
          :modelImage="false"
          :modelDescription="false"
          name="Address"
        />
        <div class="flex">
          <shad-form-field v-slot="{ componentField }" name="addressLookup">
            <shad-form-item class="w-full">
              <shad-form-label>Address Lookup</shad-form-label>
              <shad-form-control>
                <google-places-autocomplete
                  class="w-full"
                  placeholder="Address Lookup"
                  @selected="setAddress($event)"
                />
              </shad-form-control>
            </shad-form-item>
          </shad-form-field>
        </div>
        <div class="flex">
          <shad-form-field v-slot="{ componentField }" name="address1" class="">
            <shad-form-item class="w-1/2 mr-3">
              <shad-form-label>Address</shad-form-label>
              <shad-form-control>
                <shad-input
                  type="text"
                  placeholder="Address"
                  v-bind="componentField"
                  v-model="state.address.address1"
                />
              </shad-form-control>
            </shad-form-item>
          </shad-form-field>
          <shad-form-field v-slot="{ componentField }" name="address2" class="">
            <shad-form-item class="w-1/2 mr-3">
              <shad-form-label>Address 2</shad-form-label>
              <shad-form-control>
                <shad-input
                  type="text"
                  placeholder="Address 2"
                  v-bind="componentField"
                  v-model="state.address.address2"
                />
              </shad-form-control>
            </shad-form-item>
          </shad-form-field>
        </div>
        <div class="flex">
          <shad-form-field v-slot="{ componentField }" name="suburb" class="">
            <shad-form-item class="w-1/3 mr-3">
              <shad-form-label>Suburb</shad-form-label>
              <shad-form-control>
                <shad-input
                  type="text"
                  placeholder="Suburb"
                  v-bind="componentField"
                  v-model="state.address.suburb"
                />
              </shad-form-control>
            </shad-form-item>
          </shad-form-field>
          <shad-form-field v-slot="{ componentField }" name="state" class="">
            <shad-form-item class="w-1/3 mr-3">
              <shad-form-label :isRequired="true">State</shad-form-label>
              <shad-form-control>
                <shad-input
                  type="text"
                  placeholder="State"
                  v-bind="componentField"
                  v-model="state.address.state"
                />
              </shad-form-control>
              <shad-form-message />
            </shad-form-item>
          </shad-form-field>
          <shad-form-field v-slot="{ componentField }" name="postcode" class="">
            <shad-form-item class="w-1/3 mr-3">
              <shad-form-label>Postcode</shad-form-label>
              <shad-form-control>
                <shad-input
                  type="text"
                  placeholder="Postcode"
                  v-bind="componentField"
                  v-model="state.address.postcode"
                />
              </shad-form-control>
            </shad-form-item>
          </shad-form-field>
          <shad-form-field v-slot="{ componentField }" name="country" class="">
            <shad-form-item class="w-1/3 mr-3">
              <shad-form-label :isRequired="true">Country</shad-form-label>
              <shad-form-control>
                <shad-input
                  type="text"
                  placeholder="Country"
                  v-bind="componentField"
                  v-model="state.address.country"
                />
              </shad-form-control>
              <shad-form-message />
            </shad-form-item>
          </shad-form-field>
        </div>
        <alp-form-divider
          :modelImage="false"
          :modelDescription="false"
          name="Postal Address"
        />
        <shad-form-field v-slot="{ componentField }" name="postalSameAsAddress">
          <shad-form-item class="w-1/2 flex">
            <shad-form-control>
              <div class="space-x-2 py-2 flex items-center">
                <shad-checkbox
                  id="postalSameAsAddress"
                  :checked="state.checked"
                  @update:checked="changeisSameAddressChecked"
                />
                <shad-form-label>Same as address</shad-form-label>
              </div>
            </shad-form-control>
          </shad-form-item>
        </shad-form-field>
        <span v-if="!state.checked">
          <div class="flex">
            <shad-form-field v-slot="{ componentField }" name="addressLookup">
              <shad-form-item class="w-full">
                <shad-form-label>Address Lookup</shad-form-label>
                <shad-form-control>
                  <google-places-autocomplete
                    class="w-full"
                    placeholder="Address Lookup"
                    @selected="setPostalAddress($event)"
                  />
                </shad-form-control>
              </shad-form-item>
            </shad-form-field>
          </div>
          <div class="flex">
            <shad-form-field
              v-slot="{ componentField }"
              name="postalAddress1"
              class=""
            >
              <shad-form-item class="w-1/2 mr-3">
                <shad-form-label>Address</shad-form-label>
                <shad-form-control>
                  <shad-input
                    type="text"
                    placeholder="Address"
                    v-bind="componentField"
                    v-model="state.postalAddress.address1"
                  />
                </shad-form-control>
              </shad-form-item>
            </shad-form-field>
            <shad-form-field
              v-slot="{ componentField }"
              name="postalAddress2"
              class=""
            >
              <shad-form-item class="w-1/2 mr-3">
                <shad-form-label>Address 2</shad-form-label>
                <shad-form-control>
                  <shad-input
                    type="text"
                    placeholder="Address 2"
                    v-bind="componentField"
                    v-model="state.postalAddress.address2"
                  />
                </shad-form-control>
              </shad-form-item>
            </shad-form-field>
          </div>
          <div class="flex">
            <shad-form-field
              v-slot="{ componentField }"
              name="postalSuburb"
              class=""
            >
              <shad-form-item class="w-1/3 mr-3">
                <shad-form-label>Suburb</shad-form-label>
                <shad-form-control>
                  <shad-input
                    type="text"
                    placeholder="Suburb"
                    v-bind="componentField"
                    v-model="state.postalAddress.suburb"
                  />
                </shad-form-control>
              </shad-form-item>
            </shad-form-field>
            <shad-form-field
              v-slot="{ componentField }"
              name="postalState"
              class=""
            >
              <shad-form-item class="w-1/3 mr-3">
                <shad-form-label :isRequired="true">State</shad-form-label>
                <shad-form-control>
                  <shad-input
                    type="text"
                    placeholder="State"
                    v-bind="componentField"
                    v-model="state.postalAddress.state"
                  />
                </shad-form-control>
                <shad-form-message />
              </shad-form-item>
            </shad-form-field>
            <shad-form-field
              v-slot="{ componentField }"
              name="postalPostcode"
              class=""
            >
              <shad-form-item class="w-1/3 mr-3">
                <shad-form-label>Postcode</shad-form-label>
                <shad-form-control>
                  <shad-input
                    type="text"
                    placeholder="Postcode"
                    v-bind="componentField"
                    v-model="state.postalAddress.postcode"
                  />
                </shad-form-control>
              </shad-form-item>
            </shad-form-field>
            <shad-form-field
              v-slot="{ componentField }"
              name="postalCountry"
              class=""
            >
              <shad-form-item class="w-1/3 mr-3">
                <shad-form-label :isRequired="true">Country</shad-form-label>
                <shad-form-control>
                  <shad-input
                    type="text"
                    placeholder="Country"
                    v-bind="componentField"
                    v-model="state.postalAddress.country"
                  />
                </shad-form-control>
                <shad-form-message />
              </shad-form-item>
            </shad-form-field>
          </div>
        </span>
      </TabsContent>

      <TabsContent class="space-y-4" value="abn">
        <div class="relative w-full" v-if="!state.showAbnInfo">
          <Input
            v-model="state.abnName"
            placeholder="Please enter organisation name"
            class="pl-4 pr-8"
          />
          <Search
            v-if="!state.isLoading"
            class="absolute right-2 top-2.5 size-4 text-muted-foreground cursor-pointer"
            @click="searchAbn"
          />
          <font-awesome-icon
            v-if="state.isLoading"
            icon="fa-solid fa-circle-notch"
            class="mr-2 h-4 w-4 animate-spin absolute right-2 top-2.5 size-4 text-muted-foreground cursor-pointer"
          />
          <shad-data-table
            v-if="abnlookup.records.length > 0"
            :columns="columns"
            :data="abnlookup.records"
            :count="0"
            @selected-row="rowClick"
          >
            <template v-slot:Abn="{ row }">
              <div class="flex flex-col">
                <span>{{ row.Abn }}</span>
                <div class="mt-1">
                  <span v-if="row.AbnStatus == '0000000001'">
                    <shad-badge class="bg-green-600 hover:bg-green-600"
                      >Active</shad-badge
                    >
                  </span>
                  <span v-if="row.AbnStatus == '0000000002'">
                    <shad-badge variant="secondary">Cancelled</shad-badge>
                  </span>
                </div>
              </div>
            </template>

            <template v-slot:State="{ row }">
              <span>{{ row.Postcode }} {{ row.State }}</span>
            </template>
          </shad-data-table>
          <div
            class="p-8 text-center text-muted-foreground"
            v-if="abnlookup.records.length == 0"
          >
            No records
          </div>
        </div>
        <span v-if="state.showAbnInfo">
          <div class="flex">
            <shad-form-field v-slot="{ componentField }" name="name" class="">
              <shad-form-item class="w-full">
                <shad-form-label :isRequired="true">Name</shad-form-label>
                <shad-form-control>
                  <shad-input
                    type="text"
                    placeholder="Name"
                    v-bind="componentField"
                  />
                </shad-form-control>
                <shad-form-message />
              </shad-form-item>
            </shad-form-field>
          </div>
          <div class="flex">
            <shad-form-field v-slot="{ componentField }" name="abn" class="">
              <shad-form-item class="w-full">
                <shad-form-label :isRequired="true">ABN</shad-form-label>
                <shad-form-control>
                  <shad-input
                    type="number"
                    placeholder="Abn"
                    v-bind="componentField"
                  />
                </shad-form-control>
                <shad-form-message />
              </shad-form-item>
            </shad-form-field>
          </div>
          <div class="flex">
            <shad-form-field
              v-slot="{ componentField }"
              name="estimatedRevenue"
            >
              <shad-form-item class="w-1/2 mr-3">
                <shad-form-label :isRequired="true"
                  >Estimated Revenue</shad-form-label
                >
                <shad-select v-bind="componentField" class="z-0">
                  <shad-form-control>
                    <shad-select-trigger>
                      <shad-select-value placeholder="Estimated Revenue" />
                    </shad-select-trigger>
                  </shad-form-control>
                  <shad-select-content>
                    <shad-select-group>
                      <shad-select-label
                        >Select Estimated Revenue</shad-select-label
                      >

                      <shad-select-item :value="EstimatedRevenueType.Micro">
                        Micro ($0 - $2m)
                      </shad-select-item>
                      <shad-select-item :value="EstimatedRevenueType.Small">
                        Small (&lt; $5m)
                      </shad-select-item>
                      <shad-select-item :value="EstimatedRevenueType.Medium">
                        Medium ($5m - $50m)
                      </shad-select-item>
                      <shad-select-item :value="EstimatedRevenueType.Large"
                        >Large (&gt; $50m)</shad-select-item
                      >
                    </shad-select-group>
                  </shad-select-content>
                </shad-select>

                <shad-form-message />
              </shad-form-item>
            </shad-form-field>
            <shad-form-field
              v-slot="{ componentField }"
              name="numberOfEmployees"
            >
              <shad-form-item class="w-1/2 mr-3">
                <shad-form-label :isRequired="true"
                  >Estimated Number of Employees</shad-form-label
                >
                <shad-select v-bind="componentField" class="z-0">
                  <shad-form-control>
                    <shad-select-trigger>
                      <shad-select-value
                        placeholder="Estimated Number of Employees"
                      />
                    </shad-select-trigger>
                  </shad-form-control>
                  <shad-select-content>
                    <shad-select-group>
                      <shad-select-label
                        >Select Estimated Number of Employees</shad-select-label
                      >

                      <shad-select-item :value="NumberOfEmployeesType.Micro">
                        Micro (&lt; 5)
                      </shad-select-item>
                      <shad-select-item :value="NumberOfEmployeesType.Small">
                        Small (5 - 19)
                      </shad-select-item>
                      <shad-select-item :value="NumberOfEmployeesType.Medium">
                        Medium (20 - 199)
                      </shad-select-item>
                      <shad-select-item :value="NumberOfEmployeesType.Large">
                        Large (&gt; 200)</shad-select-item
                      >
                    </shad-select-group>
                  </shad-select-content>
                </shad-select>

                <shad-form-message />
              </shad-form-item>
            </shad-form-field>
          </div>
          <div class="flex">
            <shad-form-field
              v-slot="{ componentField }"
              name="organisationType"
            >
              <shad-form-item class="w-1/2 mr-3">
                <shad-form-label :isRequired="true"
                  >Organisation Type</shad-form-label
                >
                <shad-form-control>
                  <organisation-type-selector-field
                    name="organisationType"
                    v-bind="componentField"
                    @selected="updateSelector($event, 'organisationType')"
                  />
                </shad-form-control>
              </shad-form-item>
            </shad-form-field>
            <shad-form-field
              v-slot="{ componentField }"
              name="industryCategory"
            >
              <shad-form-item class="w-1/2 mr-3">
                <shad-form-label :isRequired="true"
                  >Industry Category</shad-form-label
                >
                <shad-form-control>
                  <industry-category-selector-field
                    name="industryCategory"
                    @selected="selectIndustryCategory"
                    v-bind="componentField"
                  />
                </shad-form-control>
              </shad-form-item>
            </shad-form-field>
          </div>
          
          <shad-form-field v-slot="{ componentField }" name="phoneNumbers">
            <shad-form-item class="w-full">
              <shad-form-label>Phone Numbers</shad-form-label>
              <shad-form-control>
                <div class="space-y-2">
                  <div
                    v-for="(phone, index) in state.phoneNumbers"
                    :key="index"
                    class="grid grid-cols-[1fr_auto_auto] items-center gap-2"
                  >
                    <ContactPhoneInput
                      @update="updatePhoneNumber(index, $event)"
                      :is-valid="phone.isValid && !phone.isDuplicate"
                    />

                    <shad-select v-model="phone.label" class="w-[100px]">
                      <shad-form-control>
                        <shad-select-trigger>
                          <shad-select-value>
                            {{
                              phoneLabels.find(
                                (l) => Number(l.value) === Number(phone.label)
                              )?.key || "Select Label"
                            }}
                          </shad-select-value>
                        </shad-select-trigger>
                      </shad-form-control>
                      <shad-select-content>
                        <shad-select-group>
                          <shad-select-label>Select Label</shad-select-label>
                          <shad-select-item
                            v-for="label in phoneLabels"
                            :key="label.value"
                            :value="Number(label.value)"
                          >
                            {{ label.key }}
                          </shad-select-item>
                        </shad-select-group>
                      </shad-select-content>
                    </shad-select>

                    <shad-button
                      variant="destructive"
                      size="icon"
                      type="button"
                      @click="removePhoneNumber(index)"
                      v-if="state.phoneNumbers.length > 1"
                    >
                      <Trash2Icon class="h-4 w-4" />
                    </shad-button>
                    <span
                      v-if="state.phoneNumbers[index].errorMessage"
                      class="flex text-[0.8rem] font-medium text-destructive"
                      >{{ state.phoneNumbers[index].errorMessage }}</span
                    >
                  </div>
                </div>

                <shad-button
                  variant="outline"
                  size="sm"
                  class="mt-2"
                  type="button"
                  @click="addPhoneNumber"
                >
                  <PlusIcon class="h-4 w-4 mr-2" />
                  Add Number
                </shad-button>
              </shad-form-control>
            </shad-form-item>
          </shad-form-field>
          <div class="flex">
            <shad-form-field
              v-if="state.showSubIndustry"
              v-slot="{ componentField }"
              name="industrySubCategory"
            >
              <shad-form-item class="w-1/2 mr-3">
                <shad-form-label :isRequired="true"
                  >Industry Sub Category</shad-form-label
                >
                <shad-form-control>
                  <industry-sub-category-selector-field
                    name="industrySubCategory"
                    :industry-category-id="state.industryCategory?.id"
                    v-bind="componentField"
                    @selected="updateSelector($event, 'industrySubCategory')"
                  />
                </shad-form-control>
              </shad-form-item>
            </shad-form-field>
          </div>
          <alp-form-divider
            :modelImage="false"
            :modelDescription="false"
            name="Address"
          />
          <div class="flex">
            <shad-form-field v-slot="{ componentField }" name="addressLookup">
              <shad-form-item class="w-full">
                <shad-form-label>Address Lookup</shad-form-label>
                <shad-form-control>
                  <google-places-autocomplete
                    class="w-full"
                    placeholder="Address Lookup"
                    @selected="setAddress($event)"
                  />
                </shad-form-control>
              </shad-form-item>
            </shad-form-field>
          </div>
          <div class="flex">
            <shad-form-field
              v-slot="{ componentField }"
              name="address1"
              class=""
            >
              <shad-form-item class="w-1/2 mr-3">
                <shad-form-label>Address</shad-form-label>
                <shad-form-control>
                  <shad-input
                    type="text"
                    placeholder="Address"
                    v-bind="componentField"
                    v-model="state.address.address1"
                  />
                </shad-form-control>
              </shad-form-item>
            </shad-form-field>
            <shad-form-field
              v-slot="{ componentField }"
              name="address2"
              class=""
            >
              <shad-form-item class="w-1/2 mr-3">
                <shad-form-label>Address 2</shad-form-label>
                <shad-form-control>
                  <shad-input
                    type="text"
                    placeholder="Address 2"
                    v-bind="componentField"
                    v-model="state.address.address2"
                  />
                </shad-form-control>
              </shad-form-item>
            </shad-form-field>
          </div>
          <div class="flex">
            <shad-form-field v-slot="{ componentField }" name="suburb" class="">
              <shad-form-item class="w-1/3 mr-3">
                <shad-form-label>Suburb</shad-form-label>
                <shad-form-control>
                  <shad-input
                    type="text"
                    placeholder="Suburb"
                    v-bind="componentField"
                    v-model="state.address.suburb"
                  />
                </shad-form-control>
              </shad-form-item>
            </shad-form-field>
            <shad-form-field v-slot="{ componentField }" name="state" class="">
              <shad-form-item class="w-1/3 mr-3">
                <shad-form-label :isRequired="true">State</shad-form-label>
                <shad-form-control>
                  <shad-input
                    type="text"
                    placeholder="State"
                    v-bind="componentField"
                    v-model="state.address.state"
                  />
                </shad-form-control>
                <shad-form-message />
              </shad-form-item>
            </shad-form-field>
            <shad-form-field
              v-slot="{ componentField }"
              name="postcode"
              class=""
            >
              <shad-form-item class="w-1/3 mr-3">
                <shad-form-label>Postcode</shad-form-label>
                <shad-form-control>
                  <shad-input
                    type="text"
                    placeholder="Postcode"
                    v-bind="componentField"
                    v-model="state.address.postcode"
                  />
                </shad-form-control>
              </shad-form-item>
            </shad-form-field>
            <shad-form-field
              v-slot="{ componentField }"
              name="country"
              class=""
            >
              <shad-form-item class="w-1/3 mr-3">
                <shad-form-label :isRequired="true">Country</shad-form-label>
                <shad-form-control>
                  <shad-input
                    type="text"
                    placeholder="Country"
                    v-bind="componentField"
                    v-model="state.address.country"
                  />
                </shad-form-control>
                <shad-form-message />
              </shad-form-item>
            </shad-form-field>
          </div>
          <alp-form-divider
            :modelImage="false"
            :modelDescription="false"
            name="Postal Address"
          />
          <shad-form-field
            v-slot="{ componentField }"
            name="postalSameAsAddress"
          >
            <shad-form-item class="w-1/2">
              <shad-form-control>
                <div class="space-x-2 py-2 flex items-center">
                  <shad-checkbox
                    id="postalSameAsAddress"
                    :checked="state.checked"
                    @update:checked="changeisSameAddressChecked"
                  />
                  <shad-form-label>Same as address</shad-form-label>
                </div>
              </shad-form-control>
            </shad-form-item>
          </shad-form-field>
          <span v-if="!state.checked">
            <div class="flex">
              <shad-form-field v-slot="{ componentField }" name="addressLookup">
                <shad-form-item class="w-full">
                  <shad-form-label>Address Lookup</shad-form-label>
                  <shad-form-control>
                    <google-places-autocomplete
                      class="w-full"
                      placeholder="Address Lookup"
                      @selected="setPostalAddress($event)"
                    />
                  </shad-form-control>
                </shad-form-item>
              </shad-form-field>
            </div>
            <div class="flex">
              <shad-form-field
                v-slot="{ componentField }"
                name="postalAddress1"
                class=""
              >
                <shad-form-item class="w-1/2 mr-3">
                  <shad-form-label>Address</shad-form-label>
                  <shad-form-control>
                    <shad-input
                      type="text"
                      placeholder="Address"
                      v-bind="componentField"
                      v-model="state.postalAddress.address1"
                    />
                  </shad-form-control>
                </shad-form-item>
              </shad-form-field>
              <shad-form-field
                v-slot="{ componentField }"
                name="postalAddress2"
                class=""
              >
                <shad-form-item class="w-1/2 mr-3">
                  <shad-form-label>Address 2</shad-form-label>
                  <shad-form-control>
                    <shad-input
                      type="text"
                      placeholder="Address 2"
                      v-bind="componentField"
                      v-model="state.postalAddress.address2"
                    />
                  </shad-form-control>
                </shad-form-item>
              </shad-form-field>
            </div>
            <div class="flex">
              <shad-form-field
                v-slot="{ componentField }"
                name="postalSuburb"
                class=""
              >
                <shad-form-item class="w-1/3 mr-3">
                  <shad-form-label>Suburb</shad-form-label>
                  <shad-form-control>
                    <shad-input
                      type="text"
                      placeholder="Suburb"
                      v-bind="componentField"
                      v-model="state.postalAddress.suburb"
                    />
                  </shad-form-control>
                </shad-form-item>
              </shad-form-field>
              <shad-form-field
                v-slot="{ componentField }"
                name="postalState"
                class=""
              >
                <shad-form-item class="w-1/3 mr-3">
                  <shad-form-label :isRequired="true">State</shad-form-label>
                  <shad-form-control>
                    <shad-input
                      type="text"
                      placeholder="State"
                      v-bind="componentField"
                      v-model="state.postalAddress.state"
                    />
                  </shad-form-control>
                  <shad-form-message />
                </shad-form-item>
              </shad-form-field>
              <shad-form-field
                v-slot="{ componentField }"
                name="postalPostcode"
                class=""
              >
                <shad-form-item class="w-1/3 mr-3">
                  <shad-form-label>Postcode</shad-form-label>
                  <shad-form-control>
                    <shad-input
                      type="text"
                      placeholder="Postcode"
                      v-bind="componentField"
                      v-model="state.postalAddress.postcode"
                    />
                  </shad-form-control>
                </shad-form-item>
              </shad-form-field>
              <shad-form-field
                v-slot="{ componentField }"
                name="postalCountry"
                class=""
              >
                <shad-form-item class="w-1/3 mr-3">
                  <shad-form-label :isRequired="true">Country</shad-form-label>
                  <shad-form-control>
                    <shad-input
                      type="text"
                      placeholder="Country"
                      v-bind="componentField"
                      v-model="state.postalAddress.country"
                    />
                  </shad-form-control>
                  <shad-form-message />
                </shad-form-item>
              </shad-form-field>
            </div>
          </span>
        </span>
      </TabsContent>
    </Tabs>
  </shad-modal-form>
</template>

<script setup lang="ts">
import { Search, PlusIcon, Trash2Icon } from "lucide-vue-next";
import { Input } from "@/lib/registry/new-york/ui/input";
import GooglePlacesAutocomplete from "@/components/inputs/GooglePlacesAutocomplete.vue";
import OrganisationTypeSelectorField from "@/components/forms/selectors/OrganisationTypeSelectorField.vue";
import IndustryCategorySelectorField from "@/components/forms/selectors/IndustryCategorySelectorField.vue";
import IndustrySubCategorySelectorField from "@/components/forms/selectors/IndustrySubCategorySelectorField.vue";
import ContactPhoneInput from "@/components/common/ContactPhoneInput.vue";
import {
  IndustryCategoryServiceProxy,
  IndustrySubCategoryServiceProxy
} from "@/network/common-service-proxies";
import {
  EstimatedRevenueType,
  NumberOfEmployeesType
} from "@/network/dtos/enumTypes";
import { PhoneLabel, PhoneNumberDto } from "@/network/dtos/phone-number-dto";
import type { CountryCode } from "libphonenumber-js";
import { OrganisationStore } from "@/store/modules/organisations";
import { ErrorMessage, Field as VField, useForm } from "vee-validate";
import { defineComponent, h, onMounted, reactive, watch, ref } from "vue";
import { useStore } from "vuex";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useFocus, useDebounceFn } from "@vueuse/core";
import { useEnum } from "@/composable/enum";
import { PhoneNumberServiceProxy } from "@/network/phone-number-service-proxies";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/lib/registry/new-york/ui/tabs";
import DataTableColumnHeader from "@/components/common/layout/DataTable/DataTableColumnHeader.vue";
import { ColumnDef } from "@tanstack/vue-table";
import { useNotify } from "@/composable/notify";
import { AddressDto, AddressInput } from "@/network/dtos/address-dto";
import {
  IndustryCategoryDto,
  IndustrySubCategoryDto
} from "@/network/dtos/base-entity";
import { OrganisationInput } from "@/network/dtos/organisation-dto";

const emit = defineEmits(["created", "close"]);
const organisationFormSchema = toTypedSchema(
  z.object({
    name: z
      .string({ required_error: "Name is required" })
      .nonempty({ message: "Name is required" })
      .refine((val) => !/["*:<>?/\\|]/.test(val), {
        message: 'Name cannot contain special characters ( " * : < > ? / \\ | )'
      }),
    website: z.string().optional(),
    abn: z.string({ required_error: "Abn is required" }),
    estimatedRevenue: z.number({
      required_error: "Estimated revenue is required"
    }),
    numberOfEmployees: z.number({
      required_error: "Estimate number of employees are required"
    }),
    state: z.string({ required_error: "State is required" }),
    country: z.string({ required_error: "Country  is required" }),
    postalSameAsAddress: z.boolean().optional(),
    postalAddress: z.any().optional(),
    address1: z.string().optional(),
    address2: z.string().optional(),
    postcode: z.string().optional(),
    suburb: z.string().optional(),
    postalState: z.any({ required_error: "State is required" }),
    postalCountry: z.any({ required_error: "Country  is required" }),
    postalAddress1: z.string().optional(),
    postalAddress2: z.string().optional(),
    postalPostcode: z.string().optional(),
    postalSuburb: z.string().optional(),
    organisationType: z.union([
      z.object({
        id: z.number().optional()
      }),
      z.null()
    ]),
    industryCategory: z.union([
      z.object({
        id: z.number().optional()
      }),
      z.null()
    ]),
    industrySubCategory: z.union([
      z.object({
        id: z.number().optional()
      }),
      z.null()
    ]),
    phoneNumbers: z
      .array(
        z.object({
          number: z.string(),
          countryCode: z.string(),
          label: z.nativeEnum(PhoneLabel),
          rawNumber: z.any().optional()
        })
      )
      .optional(),
    address: z.any().optional()
  })
);
const handleSubmit = useForm({
  validationSchema: organisationFormSchema,
  initialValues: {
    abn: ""
  }
});
const props = defineProps<{
  modalOpen: number;
}>();
interface PhoneNumberData {
  label: PhoneLabel;
  countryCode: CountryCode;
  isValid: boolean;
  isDuplicate: boolean;
  isPossible: boolean;
  countryCallingCode: string;
  nationalNumber: string;
  formatInternational: string;
  formatNational: string;
  e164: string;
  rfc3966: string;
  countrySelectorOpen: boolean;
  uri: string;
  errorMessage: string;
}

const state = reactive({
  industryCategories: [] as IndustryCategoryDto[],
  industrySubCategories: [] as IndustrySubCategoryDto[],
  address: new AddressDto(),
  postalAddress: new AddressDto(),
  checked: true,
  closeModel: false,
  showSubIndustry: false,
  subIndustry: new IndustrySubCategoryDto(),
  isLoading: false,
  abnName: "",
  hideConfirmButton: false,
  selectedTab: "organisation" as string,
  showAbnInfo: false,
  industryCategory: new IndustryCategoryDto(),
  phoneNumbers: [] as Array<PhoneNumberData>
});

function fetchIndustryCategories() {
  new IndustryCategoryServiceProxy()
    .getIndustryCategoryFullList()
    .then((result) => {
      state.industryCategories = result;
    });
}

function fetchSubIndustryCategories() {
  new IndustrySubCategoryServiceProxy()
    .getIndustrySubCategoryFullList()
    .then((result) => {
      state.industrySubCategories = result;
    });
}

onMounted(() => {
  fetchIndustryCategories();
  fetchSubIndustryCategories();
  if (state.phoneNumbers.length === 0) {
    addPhoneNumber();
  }
});

const store = useStore();

let isSameAddressChecked = true;

function changeisSameAddressChecked() {
  state.checked = !state.checked;
}

const createOrganisation = handleSubmit.handleSubmit((values) => {
  state.isLoading = true;
  values.postalSameAsAddress = state.checked;

  if (values.postalSameAsAddress) {
    values.postalAddress = undefined;
  }
  const addressInput = new AddressInput({
    address1: state.address.address1,
    address2: state.address.address2,
    state: state.address.state,
    country: state.address.country,
    suburb: state.address.suburb,
    postcode: state.address.postcode
  });
  const postalAddressInput = new AddressInput({
    address1: state.postalAddress.address1,
    address2: state.postalAddress.address2,
    state: state.postalAddress.state,
    country: state.postalAddress.country,
    suburb: state.postalAddress.suburb,
    postcode: state.postalAddress.postcode
  });
  
  // Process phone numbers - same format as CreateContact.vue
  const phoneNumbers = state.phoneNumbers
    .filter((phone) => phone.nationalNumber)
    .map((phone) => ({
      number: phone.nationalNumber,
      countryCode: phone.countryCode,
      label: phone.label,
      isValid: phone.isValid,
      isPossible: phone.isPossible,
      countryCallingCode: phone.countryCallingCode,
      nationalNumber: phone.nationalNumber,
      formatInternational: phone.formatInternational,
      formatNational: phone.formatNational,
      e164: phone.e164,
      uri: phone.uri,
      rfc3966: phone.rfc3966
    }));

  // Add phone numbers to values object like CreateContact.vue
  values.phoneNumbers = phoneNumbers;
  values.address = addressInput;
  values.postalAddress = values.postalSameAsAddress == true ? undefined : postalAddressInput;
  
  console.log(values);

  store
    .dispatch(OrganisationStore.actions.CREATE_ORGANISATION, values)
    .then((organisation) => {
      emit("created", organisation);
      emit("close");
      state.closeModel = true;
      state.isLoading = false;
    });
});

function setAddress(address: any) {
  state.address.address1 = address.address;
  state.address.address2 = address.address2;
  state.address.suburb = address.suburb;
  state.address.state = address.state;
  state.address.country = address.country;
  state.address.postcode = address.postalCode;
  handleSubmit.setFieldValue("state", address.state);
  handleSubmit.setFieldValue("country", address.country);
}

function setPostalAddress(address: any) {
  state.postalAddress.address1 = address.address;
  state.postalAddress.address2 = address.address2;
  state.postalAddress.suburb = address.suburb;
  state.postalAddress.state = address.state;
  state.postalAddress.country = address.country;
  state.postalAddress.postcode = address.postalCode;
}
const initialState = reactive({ ...state });

function closeDialog() {
  state.closeModel = false;
  state.phoneNumbers = [];
  Object.assign(state, initialState);
  if (state.phoneNumbers.length === 0) {
    addPhoneNumber();
  }
}

function selectIndustryCategory(value: any) {
  if (value != null) state.showSubIndustry = true;
  else {
    state.showSubIndustry = false;
    handleSubmit.resetField("industryCategory");
  }
  state.industryCategory = value;
}
watch(
  [() => state.address.country, () => state.address.state],
  () => {
    if (state.checked && state.address.country != "") {
      handleSubmit.setFieldValue("postalCountry", "");
    }
    if (state.checked && state.address.state != "") {
      handleSubmit.setFieldValue("postalState", "");
    }
  },
  { immediate: true, deep: true }
);

watch(
  [() => state.checked],
  () => {
    if (!state.checked) {
      handleSubmit.resetField("postalState");
      handleSubmit.resetField("postalCountry");
    }
  },
  { immediate: true, deep: true }
);
function updateSelector(value: any, fieldName: any) {
  if (value == null) handleSubmit.resetField(fieldName);
}
interface AbnRecord {
  Abn: string;
  AbnStatus: string;
  Postcode: string;
  State: string;
  Name: string;
  IsCurrent: boolean;
  NameType: string;
  Score: string;
}
const abnlookup = reactive({
  records: [] as AbnRecord[]
});
const { fireErrorToast } = useNotify();
const phoneNumberService = new PhoneNumberServiceProxy();

const { toDropdownOptions: toPhoneLabelOptions } = useEnum(PhoneLabel);
const phoneLabels = toPhoneLabelOptions();

const debouncedCheckPhoneNumber = useDebounceFn(async (e164: string) => {
  if (!e164) {
    return;
  }

  try {
    const isDuplicate = await phoneNumberService.isOrganisationPhoneNumberDuplicate({
      phoneNumber: e164
    });

    const phone = state.phoneNumbers.find((p) => p.e164 === e164);
    if (phone) {
      phone.isDuplicate = isDuplicate;
      if (isDuplicate) {
        phone.errorMessage = "Phone number already exists in the database.";
      } else {
        phone.errorMessage = "";
      }
    }
  } catch (e) {
    console.error("Failed to check phone number:", e);
    fireErrorToast("Failed to verify phone number. Please try again.");
    const phone = state.phoneNumbers.find((p) => p.e164 === e164);
    if (phone) {
      phone.errorMessage = "Failed to verify phone number.";
    }
  }
}, 500);

function updatePhoneNumber(
  index: number,
  event: Partial<PhoneNumberData> | string
) {
  const phoneData: Partial<PhoneNumberData> =
    typeof event === "string" ? JSON.parse(event) : event;
  state.phoneNumbers[index] = { ...state.phoneNumbers[index], ...phoneData };

  const phone = state.phoneNumbers[index];

  // Reset validation state on change
  if (phone) {
    phone.isDuplicate = false;
    phone.errorMessage = "";
  }

  // Only check for duplicates if the number is valid and has an E.164 representation.
  if (phoneData.isValid && phoneData.e164) {
    debouncedCheckPhoneNumber(phoneData.e164);
  }
}

function addPhoneNumber() {
  state.phoneNumbers.push({
    countryCode: "AU",
    label: 1 as PhoneLabel,
    isValid: false,
    isDuplicate: false,
    isPossible: false,
    countryCallingCode: "",
    nationalNumber: "",
    formatInternational: "",
    formatNational: "",
    e164: "",
    rfc3966: "",
    uri: "",
    countrySelectorOpen: false,
    errorMessage: ""
  });
}

function removePhoneNumber(index: number) {
  state.phoneNumbers.splice(index, 1);
}

async function searchAbn() {
  if (state.abnName != "") {
    state.isLoading = true;
    abnlookup.records.splice(0);
    const name = state.abnName;
    await store
      .dispatch(OrganisationStore.getters.GET_ORGANISATION_ABN_DATA_BY_NAME, {
        name
      })
      .then((result) => {
        const values = result?.Names || [];
        if (values.length > 0) {
          values.forEach((record: any) => {
            const newRecord: AbnRecord = {
              Abn: record.Abn || "",
              AbnStatus: record.AbnStatus || "",
              Postcode: record.Postcode || "",
              State: record.State || "",
              Name: record.Name || "",
              NameType: record.NameType || "",
              IsCurrent: record.IsCurrent,
              Score: record.Score
            };
            abnlookup.records.push(newRecord);
          });
        }
      });
    state.isLoading = false;
  } else {
    fireErrorToast("Name is required");
  }
}
function rowClick(value: any) {
  handleSubmit.setFieldValue("name", value.Name);
  handleSubmit.setFieldValue("abn", value.Abn);
  state.hideConfirmButton = false;
  state.showAbnInfo = true;
}

const columns: ColumnDef<AbnRecord>[] = [
  {
    accessorKey: "Abn",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "ABN" }),
    cell: ({ row }) => h("td", row.getValue("Abn"))
  },
  {
    accessorKey: "Name",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Name" }),
    cell: ({ row }) => h("td", row.getValue("Name"))
  },
  {
    accessorKey: "NameType",
    header: ({ column }) => h(DataTableColumnHeader, { column, title: "Type" }),
    cell: ({ row }) => h("td", row.getValue("NameType"))
  },
  {
    accessorKey: "State",
    header: ({ column }) =>
      h(DataTableColumnHeader, { column, title: "Location" }),
    cell: ({ row }) => h("td", row.getValue("State"))
  }
];
watch(
  () => state.selectedTab,
  (newTab) => {
    if (newTab === "organisation") {
      state.hideConfirmButton = false;
      state.showAbnInfo = false;
      handleSubmit.setFieldValue("abn", "");
    } else if (newTab === "abn") {
      state.hideConfirmButton = true;
    }
  }
);
</script>
