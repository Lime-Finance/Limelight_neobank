import { Tabs, Tab } from 'react-bootstrap'
import dBank from '../abis/dBank.json'
import React, { Component } from 'react';
import Token from '../abis/Token.json'
import dbank from '../dbank.png';
import Web3 from 'web3';
import './App.css';

class App extends Component {

  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    if(typeof window.ethereum!=='undefined'){
      const web3 = new Web3(window.ethereum)
      const netId = await web3.eth.net.getId()
      const accounts = await web3.eth.getAccounts()

      //load balance
      if(typeof accounts[0] !=='undefined'){
        const balance = await web3.eth.getBalance(accounts[0])
        this.setState({account: accounts[0], balance: balance, web3: web3})
      } else {
        window.alert('Please login with MetaMask')
      }

      //load contracts
      try {
        const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address)
        const dbank = new web3.eth.Contract(dBank.abi, dBank.networks[netId].address)
        const dBankAddress = dBank.networks[netId].address
        this.setState({token: token, dbank: dbank, dBankAddress: dBankAddress})
      } catch (e) {
        console.log('Error', e)
        window.alert('Contracts not deployed to the current network')
      }

    } else {
      window.alert('Please install MetaMask')
    }
  }

  async deposit(amount) {
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.dbank.methods.deposit().send({value: amount.toString(), from: this.state.account})
      } catch (e) {
        console.log('Error, deposit: ', e)
      }
    }
  }

  async withdraw(e) {
    e.preventDefault()
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.dbank.methods.withdraw().send({from: this.state.account})
      } catch(e) {
        console.log('Error, withdraw: ', e)
      }
    }
  }

  async borrow(amount) {
    if(this.state.dbank!=='undefined'){
      try{
        await this.state.dbank.methods.borrow().send({value: amount.toString(), from: this.state.account})
      } catch (e) {
        console.log('Error, borrow: ', e)
      }
    }
  }

  async payOff(e) {
    e.preventDefault()
    if(this.state.dbank!=='undefined'){
      try{
        const collateralEther = await this.state.dbank.methods.collateralEther(this.state.account).call({from: this.state.account})
        const tokenBorrowed = collateralEther/2
        await this.state.token.methods.approve(this.state.dBankAddress, tokenBorrowed.toString()).send({from: this.state.account})
        await this.state.dbank.methods.payOff().send({from: this.state.account})
      } catch(e) {
        console.log('Error, pay off: ', e)
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      dbank: null,
      balance: 0,
      dBankAddress: null
    }
  }

  render() {
    return (
      <div className='text-monospace'>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
          <b> Limelight NeoBank</b>
        </a>
        </nav>


        <br></br>


         <dl class="stock-prices">


      <div class="stock-prices__primary stock-prices__grid">
    
        <div class="stock-price-list">
            <dt class="stock-prices__heading">NYSE: LIME</dt>
            <dd class="stock-prices__value">$48.83</dd>
        </div>
        <div class="stock-price-list">
            <dt class="stock-prices__heading">Change</dt>
            <dd class="stock-prices__value">-0.38%</dd>
        </div>
        <div class="stock-price-list">
            <dt class="stock-prices__heading">Volume</dt>
            <dd class="stock-prices__value">711,977</dd>
        </div>
    
      </div>
      
      <div class="stock-prices__secondary stock-prices__grid">
        <div class="stock-price-list">
            <dt class="stock-prices__heading">Open</dt>
            <dd class="stock-prices__value">$49.36</dd>
        </div>
        <div class="stock-price-list">
            <dt class="stock-prices__heading">Previous Close</dt>
            <dd class="stock-prices__value">$49.21</dd>
        </div>
        <div class="stock-price-list">
            <dt class="stock-prices__heading">Day Low / High</dt>
            <dd class="stock-prices__value">$48.75 - 49.55</dd>
        </div>
        <div class="stock-price-list">
            <dt class="stock-prices__heading">52-Week Low / High</dt>
            <dd class="stock-prices__value">$38.24 - 50.41</dd>
        </div>
    
      </div>
    
    </dl>
    
        <div className="container-fluid mt-5 text-center">
        <br></br>
          <h1>LIMELIGHT NEOBANK</h1>
          <h2>Wallet address: {this.state.account}</h2>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
              <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                <Tab eventKey="deposit" title="DEPOSIT">
                  <div>
                  <br></br>
                    How much do you want to deposit?
                    <br></br>
                    (min. amount is 0.01 ETH)
                    <br></br>
                    (1 deposit is possible at the time)
                    <br></br>
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      let amount = this.depositAmount.value
                      amount = amount * 10**18 //convert to wei
                      this.deposit(amount)
                    }}>
                      <div className='form-group mr-sm-2'>
                      <br></br>
                        <input
                          id='depositAmount'
                          step="0.01"
                          type='number'
                          ref={(input) => { this.depositAmount = input }}
                          className="form-control form-control-md"
                          placeholder='Insert amount'
                          required />
                      </div>
                      <button type='submit' className='btn btn-primary'>DEPOSIT</button>
                    </form>

                  </div>
                </Tab>
                <Tab eventKey="withdraw" title="WITHDRAW">
                  <br></br>
                    Do you want to withdraw and take interest?
                    <br></br>
                    <br></br>
                  <div>
                    <button type='submit' className='btn btn-primary' onClick={(e) => this.withdraw(e)}>WITHDRAW</button>
                  </div>
                </Tab>
                <Tab eventKey="borrow" title="BORROW">
                  <div>

                  <br></br>
                    Do you want to borrow tokens?
                    <br></br>
                    (50% of collateral in LIME tokens)
                    <br></br>
                    Type collateral amount
                    <br></br>
                    <br></br>
                    <form onSubmit={(e) => {

                      e.preventDefault()
                      let amount = this.borrowAmount.value
                      amount = amount * 10 **18 //convert to wei
                      this.borrow(amount)
                    }}>
                      <div className='form-group mr-sm-2'>
                        <input
                          id='borrowAmount'
                          step="0.01"
                          type='number'
                          ref={(input) => { this.borrowAmount = input }}
                          className="form-control form-control-md"
                          placeholder='Insert amount'
                          required />
                      </div>
                      <button type='submit' className='btn btn-primary'>BORROW</button>
                    </form>
                  </div>
                </Tab>
                <Tab eventKey="payOff" title="PAYOFF">
                  <div>

                  <br></br>
                    Do you want to payoff the loan?
                    <br></br>
                    (Receive collateral - fee)
                    <br></br>
                    <br></br>
                    <button type='submit' className='btn btn-primary' onClick={(e) => this.payOff(e)}>PAYOFF</button>
                  </div>
                </Tab>
              </Tabs>
              </div>


              
            </main>




 <section id="price-container">
   <div id="block-free">
     <h4>FREE</h4>
     <div id="monthly-fee"> $0/ month </div>
     <ul>
       <li> 1% CASHBACK </li>
       <li> NFC/EMV DEBIT CARD </li>
       <li> ATM CASH ACCESS</li>
       <li> NO LIME STAKE</li>       
     </ul>
    
   </div>
   <div id="block-premium">
      <h4>LIMELIGHT PRO</h4>
     <div id="monthly-fee"> $25/ month </div>
     <ul>
       <li> 4% CASHBACK </li>
       <li> NFC/EMV DEBIT CARD </li>
       <li> ATM CASH ACCESS </li>
       <li> 3,000 LIME STAKE </li>
       <li> ONCHAIN LIME REWARDS</li>       
     </ul>
     
   </div>
   <div id="block-metal">
     <div id="monthly-fee2"> $30/ month </div>
      <h4>PRO PLUS</h4>
     <ul>
       <li> 8 % CASHBACK </li>
       <li> NFC/EMV DEBIT CARD </li>
       <li> 100,000 LIME STAKE </li>
       <li> ONCHAIN LIME REWARDS </li>
       <li> PRO ONLY MERCHANDISE </li>       
     </ul>
    
   </div>
  </section>


          </div>
        </div>
      </div>
    );
  }
}



export default App;
