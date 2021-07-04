import {useState, useEffect} from 'react';
import {MdAccountBalanceWallet} from 'react-icons/md';
import {GiTwoCoins} from 'react-icons/gi';
import {BsCaretDown} from 'react-icons/bs';
import {ImSpinner9} from 'react-icons/im'
import Web3 from "web3"
import {everTikiAbi, tikiSwapAbi} from './abi'



function App() {


  const [userAccount, setUserAccount] = useState({
    bnbBalance: 0,
    tikiBalance: 0,
    address: null
  })

  const [swapData, setSwapData] = useState({
    pay: "",
    receive: ""
  })

  const [approveState, setApproveState] = useState(false)

  const [trxOngoing, setTrxOngoing] = useState(false)


  let web3 = new Web3(Web3.givenProvider)
  const everTikiContractAddress = "0x4cdd7d86be67b90ee46757d7b6e5a5cab8cfb3cd"
  const tikiSwapContractAddress = "0x6A0D669526D03C4e15F48062A75A8E58124D9aC6"
  // const tikiSwapContractAddress = "0x64c7B8B807D034Ff58dED40c3F6B64DD824F2515"

  const everTikiContract = new web3.eth.Contract(everTikiAbi, everTikiContractAddress);
  const tikiSwapcontract = new web3.eth.Contract(tikiSwapAbi, tikiSwapContractAddress);

  const getConnectedAccount = async () => {

    const previouslyDisconected = localStorage.getItem("disconnected");
    
    if(previouslyDisconected === "true") return;

      let [address] = await web3.eth.getAccounts()
    
      if(!address) return;
      // get balance
      const bnbBalance = await web3.eth.getBalance(address);
      const tikiBalance = await everTikiContract.methods.balanceOf(address).call();

      // convert them
      const convertedBnb = web3.utils.fromWei(bnbBalance.toString(), "ether");
      const convertedTiki = web3.utils.fromWei(tikiBalance.toString(), "ether");


      setUserAccount({
        tikiBalance: convertedTiki,
        bnbBalance: convertedBnb,
        address: address
      })

   

  }



  const connectWallet = async (e) => {
    e.preventDefault()
    const [address] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if(!address) return

    // get balance
    const bnbBalance = await web3.eth.getBalance(address);
    const tikiBalance = await everTikiContract.methods.balanceOf(address).call();

    // convert them
    const convertedBnb = web3.utils.fromWei(bnbBalance.toString(), "ether");
    const convertedTiki = web3.utils.fromWei(tikiBalance.toString(), "ether");


    setUserAccount({
      tikiBalance: convertedTiki,
      bnbBalance: convertedBnb,
      address: address
    })

    localStorage.setItem("disconnected", "false")

  }
  

  // ensure only numbers ans floating point numbers can be entered
  const validateInput = (e) => {

    const charCode = (e.which) ? e.which : e.keyCode;

    if(charCode >= 48 && charCode <= 57) {

      // if the user tries to enter leading zeros continuosly
      if(charCode === 48 && parseFloat(swapData.pay) === 0) {
        e.preventDefault()
        return false;
      }

      return true;
    }
    else if(charCode === 46 && swapData.pay.length && swapData.pay.toString().indexOf(".") === -1) {
        //allow the "." character only if it's not there before
        return true;

    }
    else {
        e.preventDefault();
        return false;
    }
  }


  const onChangePay = (e) => {
    const {value} = e.target;
      setSwapData({
        pay: value,
        receive: value * 1
      })
    
  }

  const swap = async (e) => {
    e.preventDefault();
    // alert("all good! swap functionality implementation next");
    const userAmount = web3.utils.toWei((swapData.pay).toString(), 'ether')
    const exchange = await tikiSwapcontract.methods.exchangeTik(userAmount.toString()).send({
      from: userAccount.address,
      gasLimit: 1000000,
      gasPrice: web3.utils.toWei('10', 'gwei'),
    }, (err, transactionHash) => {
      if(transactionHash) setTrxOngoing(true)
    })

    if(exchange.status === true) {
      // reset the swap data state
      setSwapData({
        pay: 0,
        receive: 0
      })
      setApproveState(false)
      setTrxOngoing(false)
    }
  }


  const getApproval = async (e) => {
    e.preventDefault();
  
    const amount = web3.utils.toWei((swapData.pay).toString(), 'ether')
    // const approval = await everTikiContract.methods.approve(tikiSwapContractAddress, userAmount.toString()) 1000000000000000000
    const approval = await everTikiContract.methods.approve(tikiSwapContractAddress, amount.toString()).send({
      from: userAccount.address,
      // gasLimit: 1000000,
      // gasPrice: web3.utils.fromWei('10', 'gwei'),
    }, (err, transactionHash) => {
      if(transactionHash) setTrxOngoing(true)
    })
    
    if(approval.status === true) {
      setApproveState(true)
      setTrxOngoing(false)
    }

  }

  const useMaxBalance = (e) => {
    e.preventDefault();
    setSwapData({
      pay: userAccount.tikiBalance,
      receive: userAccount.tikiBalance * 1
    })
  }

  const addToWallet = async (e) => {
    e.preventDefault();

    await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: "0x4cdd7d86be67b90ee46757d7b6e5a5cab8cfb3cd",
          symbol: "EVERTIKI",
          decimals: 18,
        },
      },
    });
  }

  const disconnectWallet = (e) => {
    e.preventDefault();
    setUserAccount({
      bnbBalance: 0,
      tikiBalance: 0,
      address: null
    })
    localStorage.setItem("disconnected", "true")
  }

  


  useEffect(() => {
    if(window.ethereum || window.web3) {
      getConnectedAccount()
    }
    
    
  },[])


  return (
    <div className = 'app'>
      <div className="border-b border-light">
        <header className= "flex justify-between items-center container py-4">
          <div className = "logo">LOGO</div>
          <nav>
            <ul className = "flex justify-between">
              <li className = "mx-5 align-middle"><a className = "text-white" href = "/">Welcome</a></li>
              <li className = "mx-5"><a className = "text-white" href = "/">White Paper</a></li>
              <li className = "mx-5"><a className = "text-white" href = "/">How to buy</a></li>
            </ul>
          </nav>
          {/* user account details or connect buttton */}
          {userAccount.address ?
          <>
          <div className = "bg-dark border-2 border-light rounded-full pl-2 py-1 pr-1 flex">
            <p className = "text-base flex mr-4 items-center"><GiTwoCoins className = "mr-1" /> {`${Number(userAccount.bnbBalance).toFixed(3)}BNB`}</p>
            <p className = "text-base flex mr-4 items-center"><GiTwoCoins className = "mr-1" /> {`${Number(userAccount.tikiBalance).toFixed(3)}TK`}</p>
            <p className = "text-base pt-1 flex items-center"><MdAccountBalanceWallet className = "mr-1" />{`${userAccount.address.substring(0, 5)}...${userAccount.address.substring(userAccount.address.length - 4, userAccount.address.length)}`}</p>
            <button className = "bg-red p-2 ml-2 font-semibold rounded-full shadow-md hover:bg-red-dark focus:outline-none" onClick = {disconnectWallet}>Disconnect</button>
          </div>
          <button className = "px-3 py-2 bg-light hover:text-lighter rounded-lg test-xs bg-white text-dark text-bold" onClick = {addToWallet}>Add to wallet</button> 
          </>
          :
          <button className = "px-3 py-2 bg-light hover:text-lighter rounded-lg font-bold" onClick = {connectWallet}>Connect</button>
          }
          
        </header>
      </div>
      <div className = "container flex justify-between items-center">
        <div className = "bg-image-right bg-right w-1/3 h-60 bg-no-repeat">
          {/* left hand side placeholder */}
        </div>

        <div className = "action-card w-2/5 p-5 shadow-lg rounded bg-light mx-auto mt-20">
          <h1 className = "">SWAP NOW</h1>
          <p className = "mb-5 text-sm">Swap xxxx for xxxx</p>
          <form onSubmit = {swapData.pay !== 0 ? !userAccount.address ? connectWallet : approveState ? swap : getApproval : null}>

            <div className = "flex flex-col mb-5 relative" >
              <label htmlFor = "from" className = "text-lighter mb-2">From</label>
              <input type = "text" onChange = {onChangePay} placeholder = "0" onKeyPress = {validateInput} value = {swapData.pay} id = "from" className = "bg-lighter p-2 rounded placeholder-placeholder-color pr-20" />
              <button onClick = {useMaxBalance} disabled = {userAccount.address === null} className = { userAccount.address ? `p-1 bg-dark rounded text-bold cursor-ponter d-inline absolute bottom-1 right-1 p-2 text-xs font-semibold hover:text-lighter` : "p-1 bg-dark rounded text-bold d-inline absolute bottom-1 right-1 p-2 text-xs font-semibold text-lighter cursor-not-allowed"}>MAX</button>
            </div>
            
            <BsCaretDown className = "mx-auto text-lg" />

            <div className = "flex flex-col mt-3" >
              <label htmlFor = "to" className = "text-lighter mb-2">To</label>
              <input type = "text" value = {swapData.receive} readOnly placeholder = "0" id = "to" className = "bg-lighter p-2 rounded focus:border-lighter placeholder-placeholder-color" />
            </div>

            <button type = "submit" className = "bg-dark p-2 rounded w-full mt-10 text-lighter text-bold cursor-pointer shadow-lg py-4" disabled = {swapData.pay === 0}>
              {swapData.pay && swapData.pay !== "0" ?
              trxOngoing ? <ImSpinner9 className = "animate-spin mx-auto" /> : !userAccount.address ? "Connect Wallet" : approveState ? "Swap" : "Approve" : 
              "enter amount"}</button>
            
          </form>
        </div>

        <div className = "bg-image-left bg-left w-1/3 h-60 bg-no-repeat">
          {/* right hand side placeholder */}
        </div>
      </div>
    </div>
    
    
  );
}

export default App;