<template>
    <div class="campaign-info">
        <button @click="goBackToCampaigns" class="back-button">← Back</button>

        <h2>Campaign Information</h2>

        <div v-if="loading" class="loading">
            Loading campaign details...
        </div>

        <div v-else>
            <div class="status-header">
                <span>Campaign Status</span>
                <span id="status" :class="statusClass">{{ campaign.campaignStatus }}</span>
            </div>

            <form class="campaign-form details-container" @submit.prevent="saveChanges">
                <div class="detail-group">
                    <label>Campaign Name</label>
                    <div class="input-container">
                        <input type="text" v-model="campaign.campaignName" name="campaignName" class="styled-input"
                            required />
                    </div>
                </div>

                <div class="detail-group">
                    <label>Campaign Description</label>
                    <div class="input-container">
                        <input type="text" v-model="campaign.campaignDescription" name="campaignDescription"
                            class="styled-input" required />
                    </div>
                </div>

                <div class="detail-group date-fields">
                    <div>
                        <label>Start Date</label>
                        <div class="input-container">
                            <input type="datetime-local" v-model="campaign.startDate" name="startDate"
                                class="styled-input" required />
                        </div>
                    </div>
                    <div>
                        <label>End Date</label>
                        <div class="input-container">
                            <input type="datetime-local" v-model="campaign.endDate" name="endDate" class="styled-input"
                                required />
                        </div>
                    </div>
                </div>

                <div class="detail-group">
                    <label>Linked Keywords (comma-separated)</label>
                    <div class="input-container">
                        <input type="text" v-model="keywordsInput" class="styled-input"
                            placeholder="Enter keywords separated by commas" />
                    </div>
                </div>

                <div class="detail-group">
                    <label>Campaign Status</label>
                    <div class="input-container">
                        <select v-model="campaign.campaignStatus" class="styled-input">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div class="detail-group">
                    <label>Want to receive daily digest?</label>
                    <div class="input-container">
                        <select  v-model="campaign.digestCampaign" class="styled-input">
                            <option :value="true">Yes</option>
                            <option :value="false">No</option>
                        </select>
                    </div>
                </div>

                <div class="detail-group">
                    <label>Daily Digest Frequency</label>
                    <div class="input-container">
                        <select v-model="campaign.dailyDigest" class="styled-input">
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                        </select>
                    </div>
                </div>

                <div class="button-group">
                    <button @click.prevent="stopCampaign" class="btn btn-danger mr-2" type="button">Stop
                        Campaign</button>
                    <button class="btn" type="submit" @click="saveChanges">Save Changes</button>
                </div>
            </form>

            <div v-if="error" class="alert alert-danger">{{ error }}</div>

            <div v-if="showSuccessModal" class="modal" @click.self="closeSuccessModal">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title">Changes Saved Successfully</h4>
                            <button type="button" class="btn-close" @click="closeSuccessModal"
                                aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>Your changes have been saved successfully.</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn" @click="closeSuccessModal">OK</button>
                        </div>
                    </div>
                </div>
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
            loading: true, // Indicates if the campaign details are currently being loaded
            error: null, // Holds any error message related to fetching or saving campaign details
            campaign: {
                campaignName: '', // Name of the campaign
                campaignDescription: '', // Description of the campaign
                startDate: '', // Start date of the campaign
                endDate: '', // End date of the campaign
                linkedKeywords: [], // Array of keywords linked to the campaign
                campaignStatus: 'Active', // Current status of the campaign
                digestCampaign: false, // Indicates if daily digest is enabled
                dailyDigest: 'Daily', // Frequency of the digest
            },
            keywordsInput: '', // String input for keywords, to be parsed into an array
            showSuccessModal: false, // Controls the visibility of the success modal
        };
    },
    computed: {
        // Computes the CSS class to apply based on the campaign status
        statusClass() {
            return this.campaign.campaignStatus === 'Active' ? 'text-success' : 'text-danger';
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
                // Finds the specific campaign by ID
                this.campaign = store.state.campaigns.find(c => c.id.toString() === campaignId);

                if (!this.campaign) {
                    throw new Error('Campaign not found'); // Throws an error if the campaign is not found
                }

                // Populate the keywords input field with linked keywords
                this.keywordsInput = this.campaign.linkedKeywords.join(', ');
            } catch (err) {
                this.error = err.message || 'Failed to load campaign details.'; // Sets the error message
            } finally {
                this.loading = false; // Ensures loading is set to false after the operation completes
            }
        },
        
        // Saves the changes made to the campaign
        async saveChanges() {
            const store = useCampaignStore(); // Access the campaign store
            try {
                // Prepare linked keywords by splitting the input string into an array
                this.campaign.linkedKeywords = this.keywordsInput.split(',').map(k => k.trim()).filter(k => k);

                // Update the campaign in the store
                await store.updateCampaign(this.campaign);

                // Show success modal after successful update
                this.showSuccessModal = true;
            } catch (error) {
                console.error('Error saving changes:', error); // Log the error to the console
                this.error = 'Failed to save changes. Please try again.'; // Set error message
            }
        },

        // Closes the success modal and navigates back to the campaigns overview
        closeSuccessModal() {
            this.showSuccessModal = false; // Hides the success modal
            this.goBackToCampaigns(); // Navigate back to campaigns
        },

        // Navigates back to the campaigns overview page
        goBackToCampaigns() {
            this.$router.push({ name: 'AllCampaigns' });
        },

        // Stops the campaign by updating its status
        async stopCampaign() {
            try {
                const store = useCampaignStore(); // Access the campaign store
                const campaignId = this.campaign.id; // Get the campaign's ID
                // Update the campaign status to 'Inactive'
                await store.updateCampaignStatus(campaignId, 'Inactive');
            } catch (error) {
                console.error('Error stopping campaign:', error); // Log the error
                this.error = 'Failed to stop the campaign. Please try again.'; // Set error message
            }
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
    background-color: #ddd;
    width: 30%;
    justify-content: space-between;
    padding: 5px;
    border-radius: 7px;
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

.input-container {
    background: white;
    border-radius: 4px;
    border: 1px solid #ddd;
}



.styled-input {
    border: none;
    width: 100%;
    padding: 8px 12px;
    cursor: pointer;

}

.date-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.text-success {
    color: #28a745;
    font-weight: 600;
}

.text-danger {
    color: #dc3545;
    font-weight: 600;
}

.button-group {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.loading {
    text-align: center;
    padding: 20px;
    color: #666;
}

.btn {
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 500;
    background-color: #247B7B;
    border-color: #247B7B;
    color: #ffff;
}

.btn-danger {
    background-color: #dc3545;
    border-color: #dc3545;
}

.modal {
    display: block;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    max-width: 400px;
    width: 90%;
}

.modal-header {
    border-bottom: 1px solid #dee2e6;
    padding: 1rem;
}

.modal-title {
    font-size: 1.25rem;
    font-weight: 600;
}

.modal-body {
    padding: 1rem;
}

.modal-footer {
    border-top: 1px solid #dee2e6;
    padding: 1rem;
    display: flex;
    justify-content: flex-end;
}

.btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1;
    color: #000;
    text-shadow: 0 1px 0 #fff;
    opacity: 0.5;
    cursor: pointer;
}

.btn-close:hover {
    opacity: 0.75;
}

@media (max-width: 600px) {
    .campaign-info {
        padding: 15px;
    }

    .status-header {
        width: 60%;
    }

    .date-fields {
        grid-template-columns: 1fr;
    }

    .button-group {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
    }

    .btn {
        width: 100%;
    }

    .modal-content {
        width: 90%;
    }
}
</style>