import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from '../../constants';
import nftStamp from '../../utils/PeruriCryptoStamp.json';
import { QrReader } from '@blackbox-vision/react-qr-reader';

const RedeemForm = ({ account }) => {
	const [contract, setContract] = useState(null);
	const [loading, setLoading] = useState(false);	
	const [camera, setCamera] = useState(null);
	const [text, setText] = useState("");
	const [labelText, setLabelText] = useState("Scan QR")

	const useCamera = () => {
		if (camera === null) {
			setCamera(1);
			setLabelText("Close Camera");
		}
		else {
			setCamera(null);
			setLabelText("Scan QR");
		}
	}

	const onChangeText = (event) => {
		setText(event.target.value);
	}

	const handleScan = (result, error) => {
		if (!!result) {
			setCamera(null);
			setLabelText("Scan QR");
			const voucher = JSON.parse(result?.text);
			redeem(voucher);
		}

		if (!!error) {
			console.info(error);
		}
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

	const doRedeem = () => {
		const voucher = JSON.parse(text);
		setText("");
		redeem(voucher);
	}

	const redeem = async (voucher) => {
		try {
			setLoading(true);
			const { ethereum } = window;
			if (ethereum) {
				if (contract) {
					let txn = await contract.redeem(account, voucher);
					console.log(txn);

					contract.on("NewNFTStampMinted", (redeemer, tokenId) => {
						setLoading(false);
					});
				}				
			} else {
				console.log("Ethereum object doesn't exist!");
				setLoading(false);
			}
		} catch (error) {
			console.log(error.message)
			alert('Error!\nInvalid voucher code signature or token has been minted!')
			setLoading(false);
		}
	}

	return (		
		<div className="w-full lg:w-1/2">
			<form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
				{!camera && (
				<div className="mb-4">
				  	<label className="block text-gray-700 text-sm font-bold mb-2">
						Voucher Code
				  	</label>
				  	<textarea value={text} onChange={onChangeText} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="voucher" />
				</div>)}
				
				<div className={`flex items-center ${camera ? "justify-center" : "justify-end"}`}>
				  	{!camera && (<button onClick={doRedeem} className="bg-blue-500 hover:bg-blue-700 text-white font-bold mr-2 py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
						Redeem
				  	</button>)}
				  	<button onClick={useCamera} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
						{labelText}
				  	</button>
				</div>

				{camera && (		
					<QrReader
				  		onResult = { handleScan }
				  		constraints = {{ facingMode: 'environment' }}
				  		className = { "mt-4 p-2 bg-gray-700 rounded-xl" }
				  		style={{ width: '100%' }}/>
			  	)}

			  	{loading && (<p className="mt-10 p-4 bg-yellow-400 text-xl font-bold text-white rounded-xl">Waiting network for minting, please wait...</p>)}
			</form>
		</div>
	);
}

export default RedeemForm;