import React from 'react';
import Banner from '../components/Banner';
import TopScholarships from '../components/TopScholarships';
import SuccessStories from '../components/SuccessStories';
import Roadmap from '../components/Roadmap';

const Home = () => {
    return (
        <>
            <Banner></Banner>
            <TopScholarships></TopScholarships>
            <SuccessStories></SuccessStories>
            <Roadmap></Roadmap>
        </>
    );
};

export default Home;