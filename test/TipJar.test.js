const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai"); // 添加此行
const { ethers } = require("hardhat");

describe("TipJar Contract", function () {
  // 部署合约的Fixture函数（复用部署逻辑）
  async function deployTipJarFixture() {
    const [owner, tipper, attacker] = await ethers.getSigners();
    const TipJar = await ethers.getContractFactory("TipJar");
    const tipJar = await TipJar.deploy();
    return { tipJar, owner, tipper, attacker };
  }

  describe("Initialization", function () {
    it("Should set the correct owner on deployment", async function () {
      const { tipJar, owner } = await loadFixture(deployTipJarFixture);
      expect(await tipJar.getOwner()).to.equal(owner.address);
    });

    it("Should have zero initial balance", async function () {
      const { tipJar } = await loadFixture(deployTipJarFixture);
      expect(await tipJar.getBalance()).to.equal(0);
    });
  });

  describe("tip() Functionality", function () {
    it("Should accept tips and transfer ETH to contract", async function () {
      const { tipJar, owner, tipper } = await loadFixture(deployTipJarFixture);
      const tipAmount = ethers.parseEther("0.5");

      await expect(
        tipJar.connect(tipper).tip({ value: tipAmount })
      ).to.changeEtherBalance(tipJar, tipAmount); // 验证合约余额增加
    });

    it("Should revert if tip is zero", async function () {
      const { tipJar, tipper } = await loadFixture(deployTipJarFixture);
      await expect(
        tipJar.connect(tipper).tip({ value: 0 })
      ).to.be.revertedWith("TipJar: No tip sent");
    });

    it("Should emit console.log for debugging", async function () {
      // Hardhat Network 默认捕获 console.sol 输出
      const { tipJar, tipper } = await loadFixture(deployTipJarFixture);
      await tipJar.tip({ value: 100 }); // 日志自动打印到终端
    });
  });

  describe("withdraw() Functionality", function () {
    it("Should withdraw balance correctly", async () => {
      const { tipJar, owner, tipper } = await loadFixture(deployTipJarFixture);
      const tipAmount = ethers.parseEther("1"); // 1 ETH

      // 1. 充值并确认
      const txTip = await tipJar.connect(tipper).tip({ 
        value: tipAmount,
        gasLimit: 300000
        });
      await txTip.wait(); // 显式等待交易完成

      // 2. 验证合约余额
      const balance = await ethers.provider.getBalance(tipJar.target);
      expect(balance).to.equal(tipAmount);

      // 3. 提现并验证
      const txWithdraw = await tipJar.connect(owner).withdraw();
      await expect(txWithdraw).to.changeEtherBalance(owner, tipAmount);
    });

    it("Should revert if non-owner tries to withdraw", async function () {
      const { tipJar, attacker } = await loadFixture(deployTipJarFixture);
      await expect(
        tipJar.connect(attacker).withdraw()
      ).to.be.revertedWith("TipJar: Only owner can withdraw");
    });

    it("Should revert if balance is zero", async function () {
      const { tipJar, owner } = await loadFixture(deployTipJarFixture);
      await expect(
        tipJar.connect(owner).withdraw()
      ).to.be.revertedWith("TipJar: No balance to withdraw");
    });
  });

  describe("get Functions", function () {
    it("getBalance() returns balance for owner", async function () {
      const { tipJar } = await loadFixture(deployTipJarFixture);
      expect(await tipJar.getBalance()).to.equal(0);
    });
  });

  describe("View Functions", function () {
    it("isOwner() returns true for owner", async function () {
      const { tipJar, owner } = await loadFixture(deployTipJarFixture);
      expect(await tipJar.isOwner()).to.be.true;
    });

    it("isOwner() returns false for non-owner", async function () {
      const { tipJar, tipper } = await loadFixture(deployTipJarFixture);
      expect(await tipJar.connect(tipper).isOwner()).to.be.false;
    });

    it("isContract() returns true for deployed contract", async function () {
      const { tipJar } = await loadFixture(deployTipJarFixture);
      expect(await tipJar.isContract()).to.be.true;
    });
  });
});