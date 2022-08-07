// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.9.0;

contract newsDetection {
    address public admin;
    uint256 newsCount;
    uint256 evaluatorCount;
    bool start;
    bool end;

    constructor() public {
        // Initilizing default values
        admin = msg.sender;
        newsCount = 0;
        evaluatorCount = 0;
        start = false;
        end = false;
    }

    function getAdmin() public view returns (address) {
        // Returns account address used to deploy contract (i.e.  Admin only)
        return admin;
    }

    modifier onlyAdmin() {
        // Modifier for only Admin access
        require(msg.sender == admin);
        _;
    }
    // Modeling a news
    struct News{
        uint256 newsId;
        string newsPost;
        uint256 voteCount;
		uint256 fakeCount;
        uint256 votePercetage;
    }
    mapping(uint256 => News) public newsDetails;

    // Adding new newss
    function addNews(string memory _newsPost)
        public
        // Only Admin can add
        onlyAdmin
    {
        News memory newNews=
            News({
                newsId: newsCount,
                newsPost: _newsPost,
                voteCount: 0,
                fakeCount: 0,
                votePercetage: 0
            });
        newsDetails[newsCount] = newNews;
        newsCount += 1;
    }

    // Modeling a newsDetection Details
    struct newsDetectionDetails {
        string adminName;
        string adminEmail;
        string newsdetectionTitle;
    }
    newsDetectionDetails newsdetectionDetails;

    function setnewsDetectionDetails(
        string memory _adminName,
        string memory _adminEmail,
        string memory _newsdetectionTitle

    )
        public
        // Only Admin can add
        onlyAdmin
    {
        newsdetectionDetails = newsDetectionDetails(
            _adminName,
            _adminEmail,
            _newsdetectionTitle

        );
        start = true;
        end = false;
    }

    // Get newsDetections details
    function getAdminName() public view returns (string memory) {
        return newsdetectionDetails.adminName;
    }

    function getAdminEmail() public view returns (string memory) {
        return newsdetectionDetails.adminEmail;
    }

    function getnewsDetectionTitle() public view returns (string memory) {
        return newsdetectionDetails.newsdetectionTitle;
    }
      
    // Get newss count
    function getTotalNews() public view returns (uint256) {
        // Returns total number of newss
        return newsCount;
    }

    // Get evaluators count
    function getTotalEvaluator() public view returns (uint256) {
        // Returns total number of evaluators
        return evaluatorCount;
    }

    // Modeling a evaluator
    struct Evaluator {
        address evaluatorAddress;
        string name;
        string idn;
        string profession;
        bool isVerified;
        bool hasVoted;
        bool isRegistered;
    }
    address[] public evaluators; // Array of address to store address of evaluators
    mapping(address => Evaluator) public evaluatorDetails;

    // Request to be added as evaluator
    function registerAsEvaluator(string memory _name, string memory _idn, string memory _profession) public {
        Evaluator memory newEvaluator =
            Evaluator({
                evaluatorAddress: msg.sender,
                name: _name,
                profession: _profession,
                idn: _idn,
                hasVoted: false,
                isVerified: false,
                isRegistered: true
            });
        evaluatorDetails[msg.sender] = newEvaluator;
        evaluators.push(msg.sender);
        evaluatorCount += 1;
    }

    // Verify evaluator
    function verifyEvaluator(bool _verifedStatus, address evaluatorAddress)
        public
        // Only Admin can verify
        onlyAdmin
    {
        evaluatorDetails[evaluatorAddress].isVerified = _verifedStatus;
    }

    // Vote
    function vote(uint256 newsId, bool isFake) public {
        require(evaluatorDetails[msg.sender].hasVoted == false);
        require(evaluatorDetails[msg.sender].isVerified == true);
        require(start == true);
        require(end == false);
				if(isFake) {
					newsDetails[newsId].fakeCount += 1;
				} else {
					newsDetails[newsId].voteCount += 1;
				}
        evaluatorDetails[msg.sender].hasVoted = true;
    }

    // End newsDetection
    function endnewsDetection() public onlyAdmin {
        end = true;
        start = false;
    }

    // Get newsDetection start and end values
    function getStart() public view returns (bool) {
        return start;
    }

    function getEnd() public view returns (bool) {
        return end;
    }
}