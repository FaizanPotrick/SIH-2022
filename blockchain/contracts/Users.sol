// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Users{
      
    mapping (string => string) public user_detail;//map user id to  user details(Hash)
    mapping (string => string) public region_detail;//map region id to  region details(Hash)

    //Register User
    //Input:- 1)User ID , 2)User Detail(Hash)
    function userDetails(string calldata user_id ,string calldata userDetail_hash) external {
        user_detail[user_id]=userDetail_hash;
      }
      
    //Register Region
    //Input:- 1)Region ID , 2)Region Detail(Hash)    
    function regionDetails(string calldata region_id ,string calldata regionDetail_hash) external {
        region_detail[region_id]=regionDetail_hash;
      }

}