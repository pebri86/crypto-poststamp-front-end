import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from '../../constants';
import nftStamp from '../../utils/NFTStamp.json';
import axios from 'axios';

const MyStamp = ({ account }) => {
	const [contract, setContract] = useState(null);
	const [loading, setLoading] = useState(false);
	const [nfts, setNfts] = useState([]);

	useEffect(() => {
		const { ethereum } = window;

		if (ethereum) {
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const contract = new ethers.Contract(
				CONTRACT_ADDRESS,
				nftStamp.abi,
				signer
				);

			/*
			* This is the big difference. Set our contract in state.
			*/
			setContract(contract);
		} else {
			console.log('Ethereum object not found');
		}
	}, []);

	useEffect(() => {
		let isSubscribed = true;
		const loadNFTs = async () => {
			try {
				setLoading(true);
				const { ethereum } = window;			    
				if (ethereum) {
					let data = await contract.tokensOfOwner(account)        
					const items = await Promise.all(data.map(async i => {
						const tokenUri = await contract.tokenURI(i)
						const meta = await axios.get(`https://ipfs.io/ipfs/${tokenUri.replace('ipfs://', "")}`);
						let item = {
							tokenId: i.toNumber(),
					        name: meta.data.name,
					        description: meta.data.description,
					        image: `https://ipfs.io/ipfs/${meta.data.image.replace('ipfs://', "")}`,
					    }
						return item
					}))
					if (isSubscribed) {
						setNfts(items)
						setLoading(false);
					}
				}
			} catch (error) {
				console.log(error);
				setLoading(false);
			}
		}

		if (contract) {
			loadNFTs();

			contract.on("NewNFTStampMinted", (redeemer, tokenId) => {
				loadNFTs();
			});
		}

		return () => (isSubscribed = false)
	}, [account, contract]);

	return (
		<div className="flex justify-center">
		<div className="p-4">
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
		{
			nfts.map((nft, i) => (
				<div key={i} className="border shadow rounded-xl overflow-hidden">
				<img src={nft.image} className="object-scale-down h-48 w-full" alt="Crypto Stamp" />
				<div className="p-4 bg-black">
				<p className="text-lg font-bold text-white">{nft.name}</p>
				<p className="text-xl font-bold text-gray-400">{nft.description}</p>
				<p className="text-xl font-bold text-gray-400">Token ID: {nft.tokenId}</p>
				</div>
				</div>
				))
			}
			</div>
			</div>         	
			{ !loading && nfts.length === 0 && (<p className="p-4 bg-red-400 text-2xl font-bold text-white rounded-xl">This account doesn't have any Crypto Stamp NFT!</p>) }
			{ loading && nfts.length === 0 && (<p className="p-4 bg-yellow-400 text-2xl font-bold text-white rounded-xl">Fetching your Stamp, please wait...</p>) }
			</div>
			);
}

export default MyStamp;