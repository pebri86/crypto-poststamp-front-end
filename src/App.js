import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from './constants';
import nftStamp from './utils/PeruriCryptoStamp.json';
import './App.css';
import MyStamp from './Components/MyStamp';
import RedeemForm from './Components/RedeemForm';
import VerifyPage from './Components/VerifyPage';

function App() {
	const [currentAccount, setCurrentAccount] = useState(null);
	const [page, setPage] = useState(1);

	const pageClick = (pageNumber) => {
		setPage(pageNumber);
	}

	const checkIfWalletIsConnected = async () => {
		try {
			/*
			* First make sure we have access to window.ethereum
			*/
			const { ethereum } = window;

			if (!ethereum) {
				console.log('Make sure you have MetaMask!');
				return;
			} else {
				console.log('We have the ethereum object', ethereum);
			}

			/*
			* Check if we're authorized to access the user's wallet
			*/
			const accounts = await ethereum.request({ method: 'eth_accounts' });

			/*
			* User can have multiple authorized accounts, we grab the first one if its there!
			*/
			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log('Found an authorized account:', account);
				setCurrentAccount(account);

				const provider = new ethers.providers.Web3Provider(window.ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(
					CONTRACT_ADDRESS,
					nftStamp.abi,
					signer
				);

				contract.on("NewNFTStampMinted", (redeemer, tokenId) => {
					setPage(1);
				});

				ethereum.on("accountsChanged", function(accounts) {
					setCurrentAccount(accounts[0]);
				});

			} else {
				console.log('No authorized account found');
			}
		  
		} catch (error){
				console.log(error)
		}
	};

	const connectWalletAction = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert('Get MetaMask!');
				return;
			}

			/*
			* Fancy method to request access to account.
			*/
			const accounts = await ethereum.request({
				method: 'eth_requestAccounts',
			});

			/*
			* Boom! This should print out public address once we authorize Metamask.
			*/
			console.log('Connected', accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error);
		}
	};

	const renderContent = () => {
		const { ethereum } = window;
		if (!ethereum) {
			return (
				<div>
					<h1 className="text-blue-400 font-extrabold">Get Metamask</h1>
					<p className="tracking-widest">Please install metamask to get started!</p>
				</div>
			);
		}
		else if (!currentAccount) {
			return (
				<div>
					<h1 className="text-blue-400 font-extrabold">No Wallet Connected</h1>
					<p className="tracking-widest">Please connect a wallet to see your crypto stamp or to redeem voucher!</p>
				</div>
			);
		} else if (currentAccount && page === 1) {
			return (
				<MyStamp account={currentAccount} />
			);
		} else if (currentAccount && page === 2) {
			return (
				<RedeemForm account={currentAccount} />
			);
		} else if (currentAccount && page === 3) {
			return (
				<VerifyPage account={currentAccount} />
			);
		}
	};

	const renderWallet = () => {
		if (!currentAccount) {
			return (
				<button onClick={connectWalletAction} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
					Connect Wallet
				</button>
			);
		} else if (currentAccount) {
			return (
				<p className="text-white">{`${currentAccount.substring(0, 4)}...${currentAccount.substring(currentAccount.length-4, currentAccount.length)}`} (You)</p>
			);
		}
	};

	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

	return (
		<div>
			<nav className="bg-gray-700">
				<div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
					<div className="relative flex items-center justify-between h-16">
						<div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
							<button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
								<span className="sr-only">Open main menu</span>
							</button>
						</div>
						<div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
							<div className="flex-shrink-0 flex items-center">
								<img className="hidden lg:block h-8 w-auto" src="https://upload.wikimedia.org/wikipedia/commons/c/cf/Peruri_logo.svg" alt="Peruri" />              
								<p className="hidden lg:block text-gray-300 px-3 py-2 rounded-md text-lg font-medium">CryptoStamp</p>
							</div>
							<div className="hidden sm:block sm:ml-6">
								<div className="flex space-x-4">
									<button onClick={() => pageClick(1)} className={`${(page === 1) ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} px-3 py-2 rounded-md text-sm font-medium`}>My Stamp</button>
							  		<button onClick={() => pageClick(2)} className={`${(page === 2) ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} px-3 py-2 rounded-md text-sm font-medium`}>Redeem Voucher</button>
							  		<button onClick={() => pageClick(3)} className={`${(page === 3) ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} px-3 py-2 rounded-md text-sm font-medium`}>Verify</button>
								</div>
						  	</div>
						</div>
						<div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
						  	{renderWallet()}
						  	<div className="ml-3 relative">
								<div>
							  		<button type="button" className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
										<span className="sr-only">Open user menu</span>
										<img className="h-10 w-10 rounded-full object-cover" src="/wallet.png" alt="" />
							  		</button>
								</div>
						  	</div>
						</div>
					</div>
				</div>

				<div className="sm:hidden" id="mobile-menu">
					<div className="px-2 pt-2 pb-3 space-y-1">
				  		<button onClick={() => pageClick(1)} className={`${(page === 1) ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} px-3 py-2 rounded-md text-sm font-medium`}>My Stamp</button>
						<button onClick={() => pageClick(2)} className={`${(page === 2) ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} px-3 py-2 rounded-md text-sm font-medium`}>Redeem Voucher</button>
						<button onClick={() => pageClick(3)} className={`${(page === 3) ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"} px-3 py-2 rounded-md text-sm font-medium`}>Verify</button>
					</div>
				</div>
		  	</nav>
		  	<div className="flex p-6 content-center justify-center">
			 	{renderContent()}
		  	</div>
		</div>
	);
}

export default App;
