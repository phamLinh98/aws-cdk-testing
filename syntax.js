const listSetUp = [{ A: 123 }, { B: 234 }];

const infoForSettingAPIGateway = [
  {
    api: 'get-url',
    method: 'GET',
  },
  {
    api: 'get-status',
    method: 'GET',
  },
];

const updatedInfo = infoForSettingAPIGateway.map((info, index) => ({
  ...info,
  lambdaFunc: listSetUp[index],
}));

console.log(updatedInfo);
