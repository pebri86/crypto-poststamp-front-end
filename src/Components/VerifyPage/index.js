import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from '../../constants';
import nftStamp from '../../utils/PeruriCryptoStamp.json';
import axios from 'axios';
import { QrReader } from '@blackbox-vision/react-qr-reader';

const VerifyPage = ( { account} ) => {
	const [contract, setContract] = useState(null);
	const [loading, setLoading] = useState(false);
	const [text, setText] = useState("");
	const [addr, setAddr] = useState(null);
	const [item, setItem] = useState(null);
	const [error, setError] = useState(false);	
	const [camera, setCamera] = useState(null);
	const [labelText, setLabelText] = useState("Scan QR")

	const useCamera = () => {
		if (camera === null) {
			setItem(null);
			setCamera(1);
			setLabelText("Close Camera");
		}
		else {
			setCamera(null);
			setLabelText("Scan QR");
		}
	}

	const handleScan = (result, error) => {
		if (!!result) {
			setCamera(null);
			setLabelText("Scan QR");
			const data = JSON.parse(result?.text);
			const tokenID = data.tokenId;
			setText(tokenID);
			setItem(null)
			verifyToken(tokenID);
		}

		if (!!error) {
			console.info(error);
		}
	}

	const onChangeText = (event) => {
		setText(event.target.value);
	}

	const verify = () => {
		verifyToken(parseInt(text))
	}

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

	const verifyToken = async (tokenID) => {
		setItem(null);
		setError(false);
		try {
			setLoading(true);
			const { ethereum } = window;
			if (ethereum) {
				if (contract) {
					const addr = await contract.ownerOf(tokenID);
					console.log(addr);
					console.log(account);

					if (addr) {
						setAddr(addr.toLowerCase());
						const tokenUri = await contract.tokenURI(tokenID)
						const meta = await axios.get(`https://ipfs.io/ipfs/${tokenUri.replace('ipfs://', "")}`);
						//const meta = await axios.get(`http://10.30.11.67:8080/ipfs/${tokenUri.replace('ipfs://', "")}`);
						let item = {
							tokenId: tokenID,
							name: meta.data.name,
							description: meta.data.description,
							image: `https://ipfs.io/ipfs/${meta.data.image.replace('ipfs://', "")}`,
							//image: `http://10.30.11.67:8080/ipfs/${meta.data.image.replace('ipfs://', "")}`,
						}
						setItem(item);
						console.log(item);
					}	
					setLoading(false)
				}				
			} else {
				console.log("Ethereum object doesn't exist!");
				setLoading(false);
			}
		} catch (error) {
			console.log(error.message)
			setLoading(false);
			setError(true);
		}
	}

	const renderResult = () => {
		if(item !== null){
			return (
				<div className="w-full max-w-xs">
					<h1 className="p-4 text-blue-400 font-extrabold">{`Found Crypto Stamp owned by ${(addr === account) ? "You" : "following account address " + addr.substring(0, 4) + "..." + addr.substring(addr.length-4, addr.length) }`}</h1>
					<div className="border shadow rounded-xl overflow-hidden">
					<img src={item.image} className="object-scale-down h-48 w-full" alt="Crypto Stamp" />
					<div className="p-4 bg-black">
						<p className="text-lg font-bold text-white">{item.name}</p>
						<p className="text-sm font-bold text-gray-400">{item.description}</p>
						<p className="text-sm font-bold text-gray-400">Token ID: {item.tokenId}</p>
						<a target="_blank" href={`https://testnets.opensea.io/assets/0x4a7940b20ac8812ac0993b2f3178f17404e2ef8b/${item.tokenId}`} className="text-sm text-gray-200">See @opensea here</a>
						</div>
					</div>
				</div>
			);
		}
	}

	return (		
		<div className="w-full lg:w-1/2">
			{!camera && (<form className="bg-white shadow-md rounded px-8 pt-6 pb-4 mb-4">
				{ !loading && error && (<p className="mb-5 p-4 bg-red-400 text-lg font-bold text-white rounded-xl">Could't find any Token of certain ID, this may happen if the Stamp not redeem yet</p>)}
			  	{loading && (<p className="mt-2 mb-5 p-4 bg-yellow-400 text-xl font-bold text-white rounded-xl">Checking from blockchain network, please wait...</p>)}
				<div className="mb-4">
				  	<label className="block text-gray-700 text-sm font-bold mb-2">
						Token ID
				  	</label>
				  	<input value={text} onChange={onChangeText} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" id="tokenId" />
				</div>
				
				<div className={`flex items-center ${camera ? "justify-center" : "justify-end"}`}>
					{!camera && (<button onClick={verify} className="bg-blue-500 hover:bg-blue-700 text-white font-bold mr-2 py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
						Verify
				  	</button>)}
					<button onClick={useCamera} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
						{labelText}
				  	</button>
				</div>
			</form>)}

			{camera && (		
					<QrReader
				  		onResult = { handleScan }
				  		constraints = {{ facingMode: 'environment' }}
				  		className = { "mt-4 p-2 bg-gray-700 rounded-xl" }
				  		style={{ width: '100%' }}/>
			  	)}

			<div className="flex content-center justify-center">
			 	{renderResult()} 	
			 </div>
		</div>
	);
}

export default VerifyPage;