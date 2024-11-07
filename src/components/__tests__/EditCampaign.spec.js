import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import EditCampaign from '@/views/EditCampaign.vue';
import { useCampaignStore } from '@/stores/campaignStore';

// Mock the vue-router for testing navigation functionalities
vi.mock('vue-router', () => ({
    createRouter: vi.fn(() => ({
        push: vi.fn(),
        replace: vi.fn(),
        go: vi.fn(),
        beforeEach: vi.fn(),
        afterEach: vi.fn(),
        install: vi.fn()
    })),
    createWebHistory: vi.fn(),
    useRoute: () => ({ params: { id: '1' } }),
    useRouter: () => ({
        push: vi.fn()
    })
}));

// Mock the campaign store to provide campaign data and methods
vi.mock('@/stores/campaignStore', () => ({
    useCampaignStore: vi.fn(() => ({
        state: {
            campaigns: [
                {
                    id: '1',
                    campaignName: 'Test Campaign',
                    campaignDescription: 'Test Description',
                    campaignStatus: 'Active',
                    startDate: '2024-10-01T00:00',
                    endDate: '2024-10-31T23:59',
                    linkedKeywords: ['Vue', 'Testing']
                }
            ]
        },
        fetchCampaigns: vi.fn(),
        updateCampaign: vi.fn()
    }))
}));

describe('EditCampaign Component', () => {
    let wrapper;

    // Setup before each test: mount the EditCampaign component and fetch campaign details
    beforeEach(async () => {
        wrapper = mount(EditCampaign, {
            global: {
                mocks: {
                    $route: { params: { id: '1' } },
                    $router: {
                        push: vi.fn()
                    }
                }
            }
        });
        await wrapper.vm.fetchCampaignDetails();
    });

    // Test that a loading indicator displays when loading is true
    it('displays loading indicator when loading is true', async () => {
        wrapper.setData({ loading: true });
        await wrapper.vm.$nextTick();
        expect(wrapper.find('.loading').exists()).toBe(true);
        expect(wrapper.find('.loading').text()).toContain('Loading campaign details...');
    });

    // Test that campaign details are displayed when loading is false
    it('displays campaign details when loading is false', async () => {
        wrapper.setData({ loading: false });
        await wrapper.vm.$nextTick();
        expect(wrapper.find('.details-container').exists()).toBe(true);
    });

    // Test that the correct class is applied based on campaign status
    it('applies correct class based on campaign status', async () => {
        wrapper.setData({ campaign: { campaignStatus: 'Active' } });
        expect(wrapper.find('#status').classes()).toContain('text-success');

        await wrapper.setData({ campaign: { campaignStatus: 'Inactive' } });
        expect(wrapper.find('#status').classes()).toContain('text-danger');
    });

    // Test that the campaign name input is bound correctly
    it('binds campaign name input correctly', async () => {
        wrapper.setData({ loading: false });
        await wrapper.vm.$nextTick();
        const campaignNameInput = wrapper.find('input[name="campaignName"]');
        expect(campaignNameInput.exists()).toBe(true);
        await campaignNameInput.setValue('New Campaign');
        expect(wrapper.vm.campaign.campaignName).toBe('New Campaign');
    });

    // Test that the campaign description input is bound correctly
    it('binds campaign description input correctly', async () => {
        const input = wrapper.find('input[name="campaignDescription"]');
        await input.setValue('Updated Description');
        expect(wrapper.vm.campaign.campaignDescription).toBe('Updated Description');
    });

    // Test that start and end date inputs are bound correctly
    it('binds start and end date inputs correctly', async () => {
        const startDateInput = wrapper.find('input[name="startDate"]');
        const endDateInput = wrapper.find('input[name="endDate"]');

        await startDateInput.setValue('2024-10-01T08:00');
        await endDateInput.setValue('2024-10-31T17:00');

        expect(wrapper.vm.campaign.startDate).toBe('2024-10-01T08:00');
        expect(wrapper.vm.campaign.endDate).toBe('2024-10-31T17:00');
    });

    // Test that linked keywords input is bound correctly
    it('binds linked keywords input correctly', async () => {
        wrapper.setData({ loading: false });
        await wrapper.vm.$nextTick();

        const input = wrapper.find('input[placeholder="Enter keywords separated by commas"]');
        
        expect(input.exists()).toBe(true); 
        
        await input.setValue('Vue, Testing, Campaign');
        expect(wrapper.vm.keywordsInput).toBe('Vue, Testing, Campaign');
    });

    // Test that clicking the back button calls the goBackToCampaigns method
    it('calls goBackToCampaigns method on back button click', async () => {
        const goBackToCampaigns = vi.spyOn(wrapper.vm, 'goBackToCampaigns');
        await wrapper.find('.back-button').trigger('click');
        expect(goBackToCampaigns).toHaveBeenCalled();
    });

    // Test that clicking the Stop Campaign button calls the stopCampaign method
    it('calls stopCampaign method on Stop Campaign button click', async () => {
        const stopCampaign = vi.spyOn(wrapper.vm, 'stopCampaign');
        await wrapper.find('.btn-danger').trigger('click');
        expect(stopCampaign).toHaveBeenCalled();
    });

    // Test that clicking the Save Changes button calls the saveChanges method
    it('calls saveChanges method on Save Changes button click', async () => {
        const saveChanges = vi.spyOn(wrapper.vm, 'saveChanges');
        await wrapper.find('.btn').trigger('click');
        await wrapper.find('.campaign-form').trigger('submit');
        expect(saveChanges).toHaveBeenCalled();
    });

    // Test that an error message is displayed if an error occurs during fetch
    it('displays error message if error occurs during fetch', async () => {
        wrapper.setData({ error: 'Campaign not found' });
        await wrapper.vm.$nextTick();
        expect(wrapper.find('.alert-danger').text()).toBe('Campaign not found');
    });

    // Test that keywords input is processed correctly and store update is called on save
    it('processes keywords input correctly and calls store update on save', async () => {
        // First set loading to false
        wrapper.setData({ loading: false });
        await wrapper.vm.$nextTick();
    
        // Create a mock store with a spy
        const mockUpdateCampaign = vi.fn();
        vi.mocked(useCampaignStore).mockImplementation(() => ({
            state: {
                campaigns: [
                    {
                        id: '1',
                        campaignName: 'Test Campaign',
                        campaignDescription: 'Test Description',
                        campaignStatus: 'Active',
                        startDate: '2024-10-01T00:00',
                        endDate: '2024-10-31T23:59',
                        linkedKeywords: []
                    }
                ]
            },
            fetchCampaigns: vi.fn(),
            updateCampaign: mockUpdateCampaign
        }));
    
        // Set the component data
        await wrapper.setData({
            keywordsInput: 'Vue, Testing, Campaign',
            campaign: { 
                id: '1',
                campaignName: 'Updated Campaign',
                campaignDescription: 'Test Description',
                startDate: '2024-10-01T00:00',
                endDate: '2024-10-31T23:59',
                linkedKeywords: []
            }
        });
        await wrapper.vm.$nextTick();
    
        // Trigger the save
        await wrapper.vm.saveChanges();
    
        // Verify the store method was called
        expect(mockUpdateCampaign).toHaveBeenCalled();
    });

    // Test that a success modal is displayed on successful save
    it('displays success modal on successful save', async () => {
        wrapper.setData({ showSuccessModal: false });
        await wrapper.vm.saveChanges();

        expect(wrapper.vm.showSuccessModal).toBe(true);
    
        const modal = wrapper.find('.modal');
        expect(modal.exists()).toBe(true);
        expect(modal.text()).toContain('Your changes have been saved successfully.');
    });
});