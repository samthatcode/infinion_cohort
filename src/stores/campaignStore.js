import { reactive, computed } from 'vue';
import axios from 'axios';

export const useCampaignStore = () => {
    // Holds all the campaign data and UI-related states.
    const state = reactive({
        campaigns: [], 
        loading: false, 
        error: null, 
        selectedFilter: 'All', 
        searchQuery: '', 
        startDate: null, 
        currentPage: 1, 
        itemsPerPage: 10, 
        campaignToDelete: null, 
    });

    // Computed properties calculate values based on the state data
    const filteredCampaigns = computed(() => {
        // Filters campaigns by status, search text, and start date
        const filterByStatus = campaign =>
            state.selectedFilter === 'All' || state.selectedFilter === campaign.campaignStatus;
        const filterBySearch = campaign =>
            !state.searchQuery || campaign.campaignName.toLowerCase().includes(state.searchQuery.toLowerCase());
        const filterByDate = campaign =>
            !state.startDate || new Date(campaign.startDate).toISOString().split('T')[0] === state.startDate;

        return state.campaigns.filter(campaign => filterByStatus(campaign) && filterBySearch(campaign) && filterByDate(campaign));
    });

    // Total number of filtered campaigns and Total number of pages based on filtered campaigns
    const totalItems = computed(() => filteredCampaigns.value.length); 
    const totalPages = computed(() => Math.ceil(totalItems.value / state.itemsPerPage)); 

    const paginatedCampaigns = computed(() => {
        // Shows a subset of campaigns based on the current page
        const start = (state.currentPage - 1) * state.itemsPerPage;
        const end = start + state.itemsPerPage;
        return filteredCampaigns.value.slice(start, end);
    });

    // Count of active campaigns and Count of inactive campaigns
    const activeCampaigns = computed(() => state.campaigns.filter(campaign => campaign.campaignStatus === 'Active').length); 
    const inactiveCampaigns = computed(() => state.campaigns.filter(campaign => campaign.campaignStatus === 'Inactive').length);  

    // Methods

    // Fetches campaigns from an API
    const fetchCampaigns = async () => {
        
        state.loading = true;
        state.error = null;
        try {
            const response = await axios.get('https://infinion-test-int-test.azurewebsites.net/api/Campaign');
            state.campaigns = response.data; 
            state.currentPage = 1; 
        } catch (error) {
            state.error = error.response?.data || 'An error occurred while fetching campaigns.';
        } finally {
            state.loading = false;
        }
    };

    const deleteCampaign = async (id) => {
        // Deletes a campaign with the given ID
        state.error = null;
        try {
            await axios.delete(`https://infinion-test-int-test.azurewebsites.net/api/Campaign/${id}`);
            state.campaigns = state.campaigns.filter(campaign => campaign.id !== id); 

            // Adjust current page if the deletion affects pagination
            const maxPage = Math.ceil(filteredCampaigns.value.length / state.itemsPerPage);
            if (state.currentPage > maxPage) {
                state.currentPage = Math.max(1, maxPage);
            }
        } catch (error) {
            state.error = error.response?.data || 'An error occurred while deleting the campaign.'; 
        }
    };

    const updateCampaign = async (campaign) => {
        // Updates a campaign with new data
        try {
            if (!validateCampaign(campaign)) {
                throw new Error('Validation failed. Please check your input.'); // Check if campaign data is valid
            }

            // Format the campaign data for update
            const updatedCampaign = {
                id: campaign.id,
                campaignName: campaign.campaignName,
                campaignDescription: campaign.campaignDescription,
                startDate: new Date(campaign.startDate).toISOString(),
                endDate: new Date(campaign.endDate).toISOString(),
                linkedKeywords: campaign.linkedKeywords,
                campaignStatus: campaign.campaignStatus,
                digestCampaign: campaign.digestCampaign === 'true' || campaign.digestCampaign === true,
                dailyDigest: campaign.dailyDigest,
            };

            console.log('Sending data:', JSON.stringify(updatedCampaign, null, 2));

            // Send the update request to the API
            const response = await axios.put(`https://infinion-test-int-test.azurewebsites.net/api/Campaign/${updatedCampaign.id}`, updatedCampaign);
            const index = state.campaigns.findIndex(c => c.id === updatedCampaign.id);
            if (index !== -1) {
                state.campaigns[index] = response.data; // Update the campaign in the list if it exists
            }

            await updateCampaignStatus(updatedCampaign.id, updatedCampaign.campaignStatus); // Also update the campaign status

        } catch (error) {
            state.error = error.response?.data || 'An error occurred while updating the campaign.'; 
            console.error('Error updating campaign:', error);
            alert(error.message || 'Failed to update campaign');
        }
    };

    const validateCampaign = (campaign) => {
        // Checks if the campaign data is valid
        const isValidDate = (dateString) => {
            const date = new Date(dateString);
            return !isNaN(date.getTime()); // Check if date is valid
        };
        
        // Validate campaign name, description, and dates
        return (
            campaign.campaignName &&
            campaign.campaignDescription &&
            isValidDate(campaign.startDate) &&
            isValidDate(campaign.endDate)
        );
    };

    const updateCampaignStatus = async (id, status) => {
        // Updates the campaign's status (active or inactive)
        console.log('Function called. ID:', id, 'Status:', status);
        state.error = null;
        console.log('Updating status for campaign ID:', id);
        try {
            const updatedStatus = {
                id: id,
                campaignStatus: status === 'Active'
            };

            console.log('Sending status update:', JSON.stringify(updatedStatus, null, 2));
            await axios.put(
                `https://infinion-test-int-test.azurewebsites.net/api/CampaignStatus/${id}`,
                updatedStatus
            );

            // Update the campaign's status locally if the API call is successful
            const campaignIndex = state.campaigns.findIndex(c => c.id === id);
            if (campaignIndex !== -1) {
                state.campaigns[campaignIndex] = {
                    ...state.campaigns[campaignIndex],
                    campaignStatus: status
                };
            }
        } catch (error) {
            state.error = error.response?.data || 'An error occurred while updating campaign status.'; 
            console.error('Error updating campaign status:', error);
        }
    };

    const setFilter = (filter) => {
        // Sets the filter for campaign status and resets the page
        state.selectedFilter = filter;
        state.currentPage = 1;
    };

    const onSearchInput = (query) => {
        // Sets the search query and resets the page
        state.searchQuery = query;
        state.currentPage = 1;
    };

    const onDateInput = (date) => {
        // Sets the start date for filtering and resets the page
        state.startDate = date;
        state.currentPage = 1;
    };

    return {
        // Return all state, computed properties, and methods for external use
        state,
        fetchCampaigns,
        deleteCampaign,
        updateCampaign,
        updateCampaignStatus,
        setFilter,
        onSearchInput,
        onDateInput,
        filteredCampaigns,
        paginatedCampaigns,
        totalItems,
        totalPages,
        activeCampaigns,
        inactiveCampaigns,
    };
};
