import React, { useContext, createContext } from "react";

import {
  useAddress,
  useContract,
  useMetamask,
  useContractWrite,
} from "@thirdweb-dev/react"; //all the utility from third web
import { ethers } from "ethers";
import { EditionMetadataWithOwnerOutputSchema } from "@thirdweb-dev/sdk";

//this cust context hook will allow us to connect the thirdweb logic within our entire app.
/**
 * This comp will hold all our BC logics, then we can wrap our app with this context,
 * so every single comp and page in our app will use this hook.
 */
const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const { contract } = useContract(
    '0x755807183e30ED9D929Ca012563256e9d395Bf67'
  );
  const { mutateAsync: createCampaign } = useContractWrite(
    contract,
    "createCampaign"
  ); //the contract and the fn

  //lets also grab the addr of our wallet
  const address = useAddress();
  const connect = useMetamask();

  //lets make a call to our contract
  const publishCampaign = async (form) => {
    try {
      const data = await createCampaign([
        address, // owner, the one who creates 
        form.title, // title
        form.description, // description
        form.target,
        new Date(form.deadline).getTime(), // deadline,
        form.image,
      ]);

      console.log("contract call success", data);
    } catch (error) {
      console.log("contract call failure", error);
    }
  };

  const getCampaigns = async () => {
    const campaigns = await contract.call("getCampaigns");

    //some of the params in getcampaigns are BN lets format them by mapping
    const parsedCampaings = campaigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(
        campaign.amountCollected.toString()
      ),
      image: campaign.image,
      pId: i, //proj id is the indx of our campaign
    }));

    return parsedCampaings;
  };
 
  //here is the individual user's campaign for the profile page
  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();

    //filter the campaings that matches the user addr, for their profile page
    const filteredCampaigns = allCampaigns.filter(
      (campaign) => campaign.owner === address
    );

    return filteredCampaigns; //now we can pass this as val to our hook 
  };

  //this donate() we gon use that in the campaignDetals comp under the donate btn
  const donate = async (pId, amount) => {
    const data = await contract.call("donateToCampaign", pId, { //the donateToCampaign(_Id, amt)
      value: ethers.utils.parseEther(amount),
    });

    return data;
  };
  //fetch donation
  const getDonations = async (pId) => {
    const donations = await contract.call("getDonators", pId); 
    const numberOfDonations = donations[0].length;

    const parsedDonations = [];

    for (let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString()),
      });
    }
    //now we ve the donators and the donations of each donations
    return parsedDonations;
  };

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connect,
        createCampaign: publishCampaign, 
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
//now we can wrap our entire app with the this hook.
//also we can use the above returned contract fns in all our comps by this hook.
