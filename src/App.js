import {useState, useEffect} from 'react';
import {MdAccountBalanceWallet} from 'react-icons/md';
import {GiTwoCoins} from 'react-icons/gi';
import {BsCaretDown} from 'react-icons/bs';
import Web3 from "web3"
import {everTikiAbi, tikiSwapAbi} from './abi'



function App() {


  const [userAccount, setUserAccount] = useState({
    bnbBalance: 0,
    tikiBalance: 0,
    address: null
  })

  const [swapData, setSwapData] = useState({
    pay: 0,
    receive: 0
  })

  const [approveState, setApproveState] = useState(false)


  let web3 = new Web3(Web3.givenProvider)
  const everTikiContractAddress = "0x4cdd7d86be67b90ee46757d7b6e5a5cab8cfb3cd"
  const tikiSwapContractAddress = "0x64c7B8B807D034Ff58dED40c3F6B64DD824F2515"

  const everTikiContract = new web3.eth.Contract(everTikiAbi, everTikiContractAddress);
  const tikiSwapcontract = new web3.eth.Contract(tikiSwapAbi, tikiSwapContractAddress);

  const getConnectedAccount = async () => {
    
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

  }

  // ensure only numbers ans floating point numbers can be entered
  const validateInput = (e) => {
    const charCode = (e.which) ? e.which : e.keyCode;

    if(charCode >= 48 && charCode <= 57) {
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
      receive: value * 1.25
    })
  }

  const swap = (e) => {
    e.preventDefault();
    
    alert("all good! swap functionality implementation next")
  }


  const getApproval = async (e) => {
    e.preventDefault();
    const approval = await everTikiContract.methods.approve(userAccount.address, swapData.pay).send({from: userAccount.address})
    
    if(approval.status === true) setApproveState(true)
  }

  


  useEffect(() => {

    getConnectedAccount()
    
  })


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
          <div className = "bg-dark border-2 border-light rounded p-2 flex">
            <p className = "text-base flex mr-4 items-center"><GiTwoCoins className = "mr-1" /> {`${userAccount.bnbBalance}BNB`}</p>
            <p className = "text-base flex mr-4 items-center"><GiTwoCoins className = "mr-1" /> {`${userAccount.tikiBalance}TK`}</p>
            <p className = "text-base pt-1 flex items-center"><MdAccountBalanceWallet className = "mr-1" />{`${userAccount.address.substring(0, 5)}...${userAccount.address.substring(userAccount.address.length - 4, userAccount.address.length)}`}</p>
          </div> :
          <button className = "px-5 py-3 bg-light text-lighter rounded rounded-full" onClick = {connectWallet}>Connect</button>
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
          <form onSubmit = {swapData.pay != 0 ? !userAccount.address ? connectWallet : approveState ? swap : getApproval : null}>

            <div className = "flex flex-col mb-5" >
              <label htmlFor = "you-pay" className = "text-lighter mb-2">You Pay</label>
              <input type = "text" onChange = {onChangePay} onKeyPress = {validateInput} value = {swapData.pay} id = "you-pay" className = "bg-lighter p-2 rounded" />
            </div>
            
            <BsCaretDown className = "mx-auto text-lg" />

            <div className = "flex flex-col mt-3" >
              <label htmlFor = "you-receive" className = "text-lighter mb-2">You receive</label>
              <input type = "text" value = {swapData.receive} readOnly id = "you-receive" className = "bg-lighter p-2 rounded focus:border-lighter" />
            </div>

            <input type = "submit" className = "bg-dark p-2 rounded w-full mt-10 text-lighter text-bold cursor-pointer shadow-lg py-4" value = {swapData.pay != 0 ? !userAccount.address ? "Connect Wallet" : approveState ? "Swap" : "Approve" : "enter amount"} disabled = {swapData.pay == 0} />
            
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
