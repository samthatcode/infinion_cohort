<template>
    <div class="container-fluid">
        <h1>All Campaigns</h1>

        <div class="search-bar">
            <p :class="{ selected: state.selectedFilter === 'All' }" @click="setFilter('All')">
                All ({{ totalItems }})
            </p>
            <p :class="{ selected: state.selectedFilter === 'Inactive' }" @click="setFilter('Inactive')">
                Inactive ({{ inactiveCampaigns }})
            </p>
            <p :class="{ selected: state.selectedFilter === 'Active' }" @click="setFilter('Active')">
                Active ({{ activeCampaigns }})
            </p>

            <input type="search" class="form-control mx-2" placeholder="Search..." v-model="state.searchQuery"
                @input="onSearchInput($event.target.value)">

            <input type="date" class="form-control" v-model="state.startDate" @input="onDateInput($event.target.value)"
                placeholder="Start Date">
        </div>

        <div v-if="state.loading" class="loading">Loading campaign details...</div>

        <!-- Responsive table for all screen sizes -->
        <div v-else class="table-responsive mt-4">
            <table class="table table-bordered table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>S/N</th>
                        <th>Campaign Name</th>
                        <th>Start Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(campaign, index) in paginatedCampaigns" :key="campaign.id">
                        <td>{{ getSerialNumber(index) }}</td>
                        <td>{{ campaign.campaignName }}</td>
                        <td>{{ formatDate(campaign.startDate) }}</td>
                        <td :class="getStatusClass(campaign.campaignStatus)">
                            {{ campaign.campaignStatus }}
                        </td>
                        <td>
                            <router-link :to="{ name: 'ViewCampaign', params: { id: campaign.id } }">
                                <button class="btn btn-link p-0">
                                    <img src="/src/assets/mdi_eye-outline.png" alt="View Icon">
                                </button>
                            </router-link>
                            <router-link :to="{ name: 'EditCampaign', params: { id: campaign.id } }">
                                <button class="btn btn-link p-0">
                                    <img src="/src/assets/lucide_edit.png" alt="Edit Icon">
                                </button>
                            </router-link>
                            <button class="btn btn-link p-0" @click="openDeleteModal(campaign.id)">
                                <img src="/src/assets/material-symbols_delete-outline-rounded.png" alt="Delete Icon">
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Vuetify Pagination -->
        <v-container>
            <v-row justify="center">
                <v-col cols="5" class="d-flex justify-center">
                    <v-pagination v-model="state.currentPage" :length="totalPages" :total-visible="6" class="my-4"
                        rounded="circle" color="green" @update:model-value="onPageChange"
                        :disabled="totalPages <= 1"></v-pagination>
                </v-col>
            </v-row>
        </v-container>

        <!-- Delete Confirmation Modal -->
        <div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="deleteModalLabel">Confirm Deletion</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center">
                        <p>Are you sure you want to delete this campaign?</p>
                        <p>This action can't be undone.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn cancelBtn" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" @click="confirmDelete">Delete Campaign</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useCampaignStore } from '@/stores/campaignStore';
import { onMounted, ref } from 'vue';
import { Modal } from 'bootstrap';

export default {
    setup() {
        const store = useCampaignStore(); // Access the campaign store
        const deleteModal = ref(null); // Reference for the delete modal
        const campaignToDelete = ref(null); // Holds the ID of the campaign to delete

        // Lifecycle hook that runs on component mount
        onMounted(() => {
            store.fetchCampaigns(); // Fetch campaigns when the component is mounted
            deleteModal.value = new Modal(document.getElementById('deleteModal')); // Initialize the Bootstrap modal
        });

        // Function to open the delete modal and set the campaign ID to delete
        const openDeleteModal = (id) => {
            campaignToDelete.value = id; // Set the ID of the campaign to delete
            deleteModal.value?.show(); // Show the delete modal
        };

        // Function to confirm the delete action
        const confirmDelete = async () => {
            if (campaignToDelete.value) {
                await store.deleteCampaign(campaignToDelete.value); // Call the delete function from the store
                deleteModal.value?.hide(); // Hide the delete modal
                campaignToDelete.value = null; // Reset the campaign ID
            }
        };

        // Function to calculate the serial number for pagination
        const getSerialNumber = (index) => {
            return (store.state.currentPage - 1) * store.state.itemsPerPage + index + 1;
        };

        // Function to format a date into a readable string
        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        };

        // Function to return the appropriate CSS class based on campaign status
        const getStatusClass = (status) => {
            return status === 'Active' ? 'text-success' : 'text-danger';
        };

        // Return all the reactive properties and methods to the template
        return {
            state: store.state, // Campaign state from the store
            deleteCampaign: store.deleteCampaign, // Method to delete a campaign
            fetchCampaigns: store.fetchCampaigns, // Method to fetch campaigns
            filteredCampaigns: store.filteredCampaigns, // Filtered campaigns from the store
            paginatedCampaigns: store.paginatedCampaigns, // Paginated campaigns
            totalItems: store.totalItems, // Total number of items
            totalPages: store.totalPages, // Total number of pages
            activeCampaigns: store.activeCampaigns, // Active campaigns
            inactiveCampaigns: store.inactiveCampaigns, // Inactive campaigns
            setFilter: store.setFilter, // Method to set filter criteria
            onSearchInput: store.onSearchInput, // Method to handle search input
            onDateInput: store.onDateInput, // Method to handle date input
            deleteModal, // Reference to the delete modal
            campaignToDelete, // ID of the campaign to delete
            openDeleteModal, // Function to open the delete modal
            confirmDelete, // Function to confirm deletion
            getSerialNumber, // Function to get serial number for pagination
            formatDate, // Function to format a date
            getStatusClass, // Function to get status class
        };
    }
};
</script>

<style scoped>
.container-fluid {
    width: 75%;
}

h1 {
    color: #247B7B;
    margin: 20px 0;
}

.loading {
    text-align: center;
    padding: 20px;
    font-style: italic;
    color: #666;
}

.search-bar {
    display: flex;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
}

.search-bar>p {
    border: 1px solid #247B7B;
    padding: 10px;
    margin: 0;
    color: #247B7B;
    border-radius: 5px;
    cursor: pointer;
    min-width: 100px;
    text-align: center;
}

.search-bar>p.selected {
    background-color: #247B7B;
    color: white;
}

input.form-control {
    max-width: 200px;
}

table {
    text-align: center;
}

.card-title {
    color: #247B7B;
}

.card-text {
    margin-bottom: 0.5rem;
}

.actions {
    display: flex;
    gap: 10px;
    justify-content: flex-start;
}

.actions button {
    margin: 0;
    padding: 5px;
}

.text-success {
    color: #28a745 !important;
    font-weight: bold;
    text-transform: uppercase;
}

.text-danger {
    color: #dc3545 !important;
    font-weight: bold;
    text-transform: uppercase;
}

.cancelBtn {
    border: 1px solid #dee2e6;
}


.v-pagination {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
}

.v-pagination__item {
    background-color: #247B7B;
    color: white;
    border-radius: 4px;
}

.v-pagination__item--active {
    background-color: #1e6969;
}

.v-pagination__navigation {
    background-color: #247B7B;
    color: white;
    border-radius: 4px;
}

.v-pagination__navigation--disabled {
    background-color: #ddd;
    color: #666;
}

@media (max-width: 768px) {
    .container-fluid {
        width: 95%;
    }

    .search-bar {
        justify-content: center;
    }
}
</style>