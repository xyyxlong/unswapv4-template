require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  gasReporter: {
  outputFile: 'gas-report.txt',  // 输出文件
  noColors: true,                // 禁用控制台颜色（确保文件内容纯净）
  currency: 'USD',               // 可选：按法币估算成本
  token: 'ETH',                  // 可选：主网类型
  }
};



