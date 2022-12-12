import React, { useState, useEffect } from "react";

import { DisplayCampaigns } from "../components";
import { useStateContext } from "../context";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  
  const { address, contract, getCampaigns } = useStateContext();//our cust hook

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const data = await getCampaigns();
    setCampaigns(data);
    setIsLoading(false);
  };

  useEffect(() => { //we ve to ensure the contract is there b4 we make a call
    if (contract) fetchCampaigns(); //here we wana  call getcampaign which is an async(), since we can't call async()/(can't await) immediately inside the useEffect, so we'l getCampaign from fetchcampaign() 
  }, [address, contract]);

  return ( //instead of looping oveer the campaigns we can now use Displaycampaign comp, so we can reuse this in our profile pages as well
    <DisplayCampaigns
      title="All Campaigns"
      isLoading={isLoading}
      campaigns={campaigns}
    />
  );
};

export default Home;
