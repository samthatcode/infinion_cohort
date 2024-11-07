<template>
    <div class="campaign-info">
        <button @click="goBackToCampaigns" class="back-button">← Back</button>

        <h2>Campaign Details</h2>

        <div v-if="loading" class="loading">
            Loading campaign details...
        </div>

        <div v-else-if="error" class="alert alert-danger">
            {{ error }}
        </div>

        <div v-else class="campaign-details">
            <div class="status-header">
                <span>Campaign Status</span>
                <span :class="statusClass">{{ campaign.campaignStatus }}</span>
            </div>

            <div class="details-container">
                <div class="detail-group">
                    <label>Campaign Name</label>
                    <div class="detail-value">{{ campaign.campaignName }}</div>
                </div>

                <div class="detail-group">
                    <label>Campaign Description</label>
                    <div class="detail-value">{{ campaign.campaignDescription }}</div>
                </div>

                <div class="detail-group date-fields">
                    <div>
                        <label>Start Date</label>
                        <div class="detail-value">{{ formatDate(campaign.startDate) }}</div>
                    </div>
                    <div>
                        <label>End Date</label>
                        <div class="detail-value">{{ formatDate(campaign.endDate) }}</div>
                    </div>
                </div>

                <div class="detail-group">
                    <label>Linked Keywords</label>
                    <div class="detail-value">
                        <span v-if="campaign.linkedKeywords && campaign.linkedKeywords.length">
                            {{ campaign.linkedKeywords.join(', ') }}
                        </span>
                        <span v-else>No keywords linked</span>
                    </div>
                </div>

                <div class="detail-group">
                    <label>Daily Digest</label>
                    <div class="detail-value">{{ campaign.digestCampaign ? 'Yes' : 'No' }}</div>
                </div>

                <div class="detail-group">
                    <label>Digest Frequency</label>
                    <div class="detail-value">{{ campaign.dailyDigest }}</div>
                </div>
            </div>

            <div class="button-group">
                <button @click="goBackToCampaigns" class="btn me-5">Back to Campaigns</button>
                <button @click="editCampaigns" class="btn edit-btn">Edit Campaigns</button>
            </div>

        </div>
    </div>
</template>

<script>
import { useRoute } from 'vue-router';
import { useCampaignStore } from '@/stores/campaignStore';

export default {
    data() {
        return {
            loading: true, // Indicates if the campaign details are being loaded
            error: null, // Stores any error message related to fetching campaign details
            campaign: null, // Holds the campaign details once fetched
        };
    },
    computed: {
        // Computes the class to apply based on the campaign status
        statusClass() {
            return this.campaign && this.campaign.campaignStatus === 'Active' ? 'text-success' : 'text-danger';
        },
    },
    methods: {
        // Fetches the campaign details based on the route parameter
        async fetchCampaignDetails() {
            const route = useRoute(); // Gets the current route information
            const store = useCampaignStore(); // Access the campaign store
            try {
                // Fetch campaigns if the store is empty
                if (store.state.campaigns.length === 0) {
                    await store.fetchCampaigns();
                }

                const campaignId = route.params.id; // Gets the campaign ID from the route
                const campaigns = store.state.campaigns; // Gets the list of campaigns

                console.log('Available campaigns:', campaigns);
                console.log('Fetching campaign with ID:', campaignId);

                // Finds the specific campaign by ID
                this.campaign = campaigns.find(c => c.id.toString() === campaignId);

                if (!this.campaign) {
                    throw new Error('Campaign not found'); // Throws an error if the campaign is not found
                }
            } catch (err) {
                this.error = err.message || 'Failed to load campaign details.'; // Sets the error message
            } finally {
                this.loading = false; // Sets loading to false after the operation is complete
            }
        },
        // Navigates back to the campaigns overview
        goBackToCampaigns() {
            this.$router.push({ name: 'AllCampaigns' });
        },
        // Navigates to the edit campaign page
        editCampaigns() {
            this.$router.push({ name: 'EditCampaign' });
        },
        // Formats the date to a locale string
        formatDate(date) {
            return new Date(date).toLocaleDateString();
        },
    },
    // Fetches the campaign details when the component is mounted
    mounted() {
        this.fetchCampaignDetails();
    },
};
</script>

<style scoped>
.campaign-info {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

h2 {
    color: #247B7B;
}

.back-button {
    border: none;
    background: none;
    color: #247B7B;
    font-size: 1.1em;
    padding: 10px 0;
    cursor: pointer;
}

.status-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
}

.details-container {
    padding: 20px;
    border-radius: 8px;
}

.detail-group {
    margin-bottom: 20px;
}

.detail-group label {
    display: block;
    font-weight: 600;
    margin-bottom: 5px;
    color: #666;
}

.detail-value {
    padding: 8px;
    background: white;
    border-radius: 4px;
    border: 1px solid #ddd;
    min-height: 38px;
}

.btn {
    background-color: #247B7B;
    color: #ffff;
}

.date-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.text-success {
    color: #28a745;
}

.text-danger {
    color: #dc3545;
}

.button-group {
    margin-top: 20px;
}

.loading {
    text-align: center;
    padding: 20px;
    color: #666;
}

@media (max-width: 600px) {
    .btn {
        width: 90%;
    }

    .edit-btn {
        margin-top: 10px;
    }
}
</style>