import { url } from "inspector";
import { HomeIcon, BookTemplate, Trash, Settings } from "lucide-react";

export const data = {
    user : {
        name: 'shadcn',
        email: 'shadcn@shadcn.com',
        avatar : '/avatars/shadcn.jpg'
    },

    navMain : [{
        title : 'Home',
        url : '/dashboard',
        icon : HomeIcon 
    },
    {
        title : 'Templates',
        url : '/templates',
        icon : BookTemplate 
    },
    {
        title : 'Trash',
        url : '/trash',
        icon : Trash 
    },
    {
        title : 'Settings',
        url : '/settings',
        icon : Settings 
    }]
}