// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
import "hardhat/console.sol";  // 引入 Hardhat 控制台库
contract TipJar {
    address public own;

    // NOTE: ---------------------------------------------------------
    // state variables should typically be unique to a pool
    // a single hook contract should be able to service multiple pools
    // ---------------------------------------------------------------


    constructor() {
        own = msg.sender;
        console.log("own:", own); 
    }

    function tip() public payable  {
        
        require(msg.value > 0, "TipJar: No tip sent");
        console.log("balance:", msg.value); 
    }

    function withdraw() public {
        require(msg.sender == own, "TipJar: Only owner can withdraw");
        uint256 balance = address(this).balance;
        require(balance > 0, "TipJar: No balance to withdraw");
        
        (bool success, ) = own.call{value: balance}("");
        require(success, "TipJar: Withdraw failed");
        console.log("Withdrawn:", balance);
    }
    
    function getBalance() public view returns (uint256) {
        console.log("address(this).balance:", address(this).balance); 
        return address(this).balance;
    }
    function getOwner() public view returns (address) {
        return own;
    }
    function isOwner() public view returns (bool) {
        return msg.sender == own;
    }   

    function isContract() public view returns (bool) {
        uint32 size;
        assembly {
            size := extcodesize(address())
        }
        return size > 0;
    }
}

