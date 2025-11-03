export type Category = {
    id: string;
    name: string;
    image: string;
    tags: string[];
};

export const categories: Category[] = [
    {
        id: '1',
        name: 'Gaming',
        image: 'https://picsum.photos/id/23/200/300',
        tags: ['IRL', 'RPG', 'Esports']
    },
    {
        id: '2',
        name: 'Music',
        image: 'https://picsum.photos/id/45/200/300',
        tags: ['Live', 'DJ', 'Concert']
    },
    {
        id: '3',
        name: 'Technology',
        image: 'https://picsum.photos/id/64/200/300',
        tags: ['Coding', 'AI', 'Startups']
    },
    {
        id: '4',
        name: 'Art',
        image: 'https://picsum.photos/id/102/200/300',
        tags: ['Painting', 'Digital', 'Design']
    },
    {
        id: '5',
        name: 'Sports',
        image: 'https://picsum.photos/id/177/200/300',
        tags: ['Football', 'Cricket', 'Fitness']
    },
    {
        id: '6',
        name: 'Education',
        image: 'https://picsum.photos/id/221/200/300',
        tags: ['Tutorials', 'Courses', 'Lectures']
    }
];
