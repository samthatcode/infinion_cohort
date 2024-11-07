// ViewCampaign.spec.js
import { shallowMount } from '@vue/test-utils';
import ViewCampaign from '@/views/ViewCampaign.vue';
import { useCampaignStore } from '@/stores/campaignStore';
import { useRoute } from 'vue-router';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock both the campaign store and vue-router
vi.mock('@/stores/campaignStore', () => ({
    useCampaignStore: vi.fn(),
}));

vi.mock('vue-router', () => ({
    useRoute: vi.fn(),
}));

describe('ViewCampaign.vue', () => {
    let wrapper;
    let campaignStoreMock;
    let routeMock;

    // Setup before each test: create mock route and store, then mount the component
    beforeEach(() => {
        // Mock route parameters
        routeMock = {
            params: {
                id: '123', // Sample campaign ID
            },
        };
        useRoute.mockReturnValue(routeMock); // Provide the mock route to the component

        // Mock campaign store with an initial state and fetch function
        campaignStoreMock = {
            state: { campaigns: [] }, // Initial empty campaigns list
            fetchCampaigns: vi.fn(), // Mock fetch function
        };
        useCampaignStore.mockReturnValue(campaignStoreMock); // Provide the mock store to the component

        // Mount the ViewCampaign component
        wrapper = shallowMount(ViewCampaign, {
            global: {
                mocks: {
                    $router: {
                        push: vi.fn(), // Mock router push function
                    },
                },
            },
        });
    });

    // Test that a loading message is displayed initially
    it('shows loading message initially', async () => {
        await wrapper.setData({ loading: true, error: null, campaign: null });
        const loadingElement = wrapper.find('.loading');
        expect(loadingElement.exists()).toBe(true);
        expect(loadingElement.text()).toBe('Loading campaign details...');
    });

    // Test that an error message is displayed when there is an error
    it('displays error message when there is an error', async () => {
        await wrapper.setData({
            loading: false,
            error: 'Something went wrong', // Simulate an error message
            campaign: null
        });
        const errorElement = wrapper.find('.alert-danger');
        expect(errorElement.exists()).toBe(true);
        expect(errorElement.text()).toBe('Something went wrong');
    });

    // Test that the campaign name is rendered if campaign data is available
    it('renders campaign name if campaign data is available', async () => {
        await wrapper.setData({
            loading: false,
            error: null,
            campaign: {
                campaignName: 'Test Campaign', // Mock campaign name
                campaignStatus: 'Active'
            }
        });
        const nameElement = wrapper.find('.detail-value');
        expect(nameElement.text()).toContain('Test Campaign');
    });

    // Test that the correct class is applied based on the campaign status
    it('applies correct class based on campaign status', async () => {
        // First test Active status
        await wrapper.setData({
            loading: false,
            error: null,
            campaign: {
                campaignName: 'Test Campaign',
                campaignStatus: 'Active', // Set status to Active
                id: '123',
                campaignDescription: 'Test Description',
                startDate: '2024-01-01',
                endDate: '2024-12-31'
            }
        });

        // Find the status span within the status-header
        const statusSpan = wrapper.find('.status-header span:last-child');
        expect(statusSpan.classes()).toContain('text-success'); // Ensure it has the success class

        // Test Inactive status
        await wrapper.setData({
            campaign: {
                ...wrapper.vm.campaign,
                campaignStatus: 'Inactive' // Change status to Inactive
            }
        });
        expect(statusSpan.classes()).toContain('text-danger'); // Ensure it has the danger class
    });

    // Test that fetchCampaigns is called on component mount
    it('calls fetchCampaigns on mount', () => {
        expect(campaignStoreMock.fetchCampaigns).toHaveBeenCalled(); // Check if fetchCampaigns was called
    });
});