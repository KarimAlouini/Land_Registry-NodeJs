pragma solidity ^0.4.0;

contract LandRegestryProject {
   struct land{
       string idInDB;
       string hashedInfos;
       string hashDocs;
   }
   
   
   event LogReturn(
   address MyAddress,
   string idInDB,
   string hashedInfos,
   string hashDocs
   );
   
   mapping(address =>land[]) public properties;
   mapping(address =>bool) public agents;
   
   function add(address _address,string _idInDB,string _hashedInfos,string _hashDocs)  public {
   land L;
   L.idInDB = _idInDB;
   L.hashedInfos = _hashedInfos;
   L.hashDocs = _hashDocs;
   properties[_address].push(L);
   LogReturn(_address, _idInDB, _hashedInfos,_hashDocs);
   }
   
   function accessCheck(address _senderAddress) public constant returns(bool){
       if(agents[_senderAddress]==true)
       return true ;
       else
       return false ;
   }
   function addAgent(address _address)  public {
   agents[_address]=true;
   }
   
}