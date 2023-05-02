// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../contracts/Locking.sol";

import "hardhat/console.sol";

contract TestMigrationLocking is Locking {

    function isLineCopiedCorrectly(uint id) external view returns(bool){
        uint32 currentBlock = getBlockNumber();
        uint32 currentEpoch = roundTimestamp(currentBlock);
        bool result = true;

        //check delegate=balance line
        address delegate = locks[id].delegate;
        LibBrokenLine.LineDataOld storage oldLineBalance = accountsOld[delegate].balance.initiatedLines[id];
        if (isLineRelevant(oldLineBalance, currentEpoch)) {
            LibBrokenLine.Line storage newLineBalance = accounts[delegate].balance.initiatedLines[id];
            result = result && areLinesSimilar(oldLineBalance, newLineBalance);
            //check snapshots and initial lines
            result = result && checkSnapShotAndInitialLine(accounts[delegate].balance, accountsOld[delegate].balance);
        }
        
        //check account=locked line
        address account = locks[id].account;
        LibBrokenLine.LineDataOld storage oldLineLocked = accountsOld[account].locked.initiatedLines[id];
        if (isLineRelevant(oldLineLocked, currentEpoch)) {
            LibBrokenLine.Line storage newLineLocked = accounts[account].locked.initiatedLines[id];
            result = result && areLinesSimilar(oldLineLocked, newLineLocked);
            //check snapshots and initial lines
            result = result && checkSnapShotAndInitialLine(accounts[account].locked, accountsOld[account].locked);
        }
        
        //check amounts
        result = result && isAmountTheSame(delegate);
        result = result && isAmountTheSame(account);
        
        return result;
    }

    function checkSnapShotAndInitialLine(LibBrokenLine.BrokenLine storage newBrokenLine, LibBrokenLine.BrokenLineOld storage oldBrokenLine) internal view returns(bool) {
        if (newBrokenLine.history.length != 1) {
            return false;
        }

        bool correctBias = (newBrokenLine.history[0].bias == newBrokenLine.initial.bias);
        if (!correctBias) {
            return false;
        }

        bool correctSlope = (newBrokenLine.history[0].slope == newBrokenLine.initial.slope);
        if (!correctSlope) {
            return false;
        }
        return true;
    }

    function isAmountTheSame(address user) internal view returns(bool) {
        return accounts[user].amount == accountsOld[user].amount;
    }

    function areLinesSimilar(LibBrokenLine.LineDataOld storage oldLine,  LibBrokenLine.Line storage newLine) internal view returns(bool) {
        if (oldLine.line.start != newLine.start) {
            return false;
        }
        if (oldLine.line.bias != newLine.bias) {
            return false;
        }
        if (oldLine.line.slope != newLine.slope) {
            return false;
        }
        if (oldLine.cliff != newLine.cliff) {
            return false;
        }

        return true;
    }

    function isLineRelevant(LibBrokenLine.LineDataOld storage oldLine, uint32 currentEpoch) internal view returns(bool){
        uint finishTime = oldLine.line.start + oldLine.cliff + (oldLine.line.bias / oldLine.line.slope) + 1;
        return ((finishTime < currentEpoch) ? false : true);
    }

   /*
    function isRelevant(uint id) external view returns(bool, uint) {
        uint32 currentBlock = getBlockNumber();
        uint32 currentEpoch = roundTimestamp(currentBlock);

        Lock storage lock = locks[id];

        LibBrokenLine.LineDataOld storage oldLine = accountsOld[lock.delegate].balance.initiatedLines[id];

        //line adds at time start + cliff + slopePeriod + 1(mod)
        uint finishTime = oldLine.line.start + oldLine.cliff + (oldLine.line.bias / oldLine.line.slope) + 1;

        return ((finishTime < currentEpoch) ? false : true, oldLine.line.start);
    }

    
    function getBalanceLineData(uint id) external view returns(address, LibBrokenLine.LineDataOld memory, uint, bool) {
        uint32 currentBlock = getBlockNumber();
        uint32 currentEpoch = roundTimestamp(currentBlock);
        address delegate = locks[id].delegate;

        LibBrokenLine.LineDataOld memory oldLine = accountsOld[delegate].balance.initiatedLines[id];
        uint finishTime = oldLine.line.start + oldLine.cliff + (oldLine.line.bias / oldLine.line.slope) + 1;
        return(delegate, oldLine, finishTime, (finishTime < currentEpoch) ? false : true);
    }

    function getLockedLineData(uint id) external view returns(address, LibBrokenLine.LineDataOld memory, uint, bool) {
        uint32 currentBlock = getBlockNumber();
        uint32 currentEpoch = roundTimestamp(currentBlock);
        address account = locks[id].account;

        LibBrokenLine.LineDataOld memory oldLine = accountsOld[account].locked.initiatedLines[id];
        uint finishTime = oldLine.line.start + oldLine.cliff + (oldLine.line.bias / oldLine.line.slope) + 1;
        return(account, oldLine, finishTime, (finishTime < currentEpoch) ? false : true);
    }
    */
}
