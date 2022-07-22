// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./mines.sol";

contract organisations is mines{

    struct organisation_detail {
      string organisation_id;
      string organisation_hash;
   }
    
    mapping(string => organisation_detail)public organisation;
    mapping (string => uint) public organisatinAmount;
    mapping (string =>mapping(string=> uint)) public batchAmount;

    function selling(string calldata from_organisation_id,string calldata to_organisation_id,string calldata grade,uint amount)external {
        require(keccak256(abi.encodePacked((organisation[from_organisation_id].organisation_id))) == keccak256(abi.encodePacked((from_organisation_id))),"Provided Seller Organisation ID Doesn't Exist");
        require(keccak256(abi.encodePacked((organisation[from_organisation_id].organisation_id))) == keccak256(abi.encodePacked((from_organisation_id))),"Provided Buyer Organisation ID Doesn't Exist");
        batchAmount[from_organisation_id][grade] -= amount;
        batchAmount[to_organisation_id][grade] += amount;
    }

}