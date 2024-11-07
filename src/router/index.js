import { createRouter, createWebHistory } from 'vue-router';
import AllCampaign from '/src/views/AllCampaign.vue';
import EditCampaign from '/src/views/EditCampaign.vue';
import ViewCampaign from '@/views/ViewCampaign.vue';

const routes = [
    {
        path: '/',
        name: 'AllCampaigns',
        component: AllCampaign,
    },
    {
        path: '/edit-campaign/:id',
        name: 'EditCampaign',
        component: EditCampaign,
        props: true
    },
    {
        path: '/view-campaign/:id',
        name: 'ViewCampaign',
        component: ViewCampaign,
        props: true
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;