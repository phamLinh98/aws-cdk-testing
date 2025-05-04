import { createInterface } from 'readline';
import chalk from 'chalk';

const askQuestion = (rl, question) => {
  return new Promise((resolve) => {
    rl.question(chalk.cyanBright(question), (answer) => resolve(answer));
  });
};

const calculateArea = async (rl) => {
  try {
    console.log(chalk.yellowBright('\n=== Tinh Dien Tich Hinh Chu Nhat ===\n'));

    const inputWidth = await askQuestion(rl, 'Nhap chieu rong: ');
    const width = parseFloat(inputWidth);

    const inputHeight = await askQuestion(rl, 'Nhap chieu dai: ');
    const height = parseFloat(inputHeight);

    if (isNaN(width) || isNaN(height)) {
      console.log(chalk.red('Vui long nhap so hop le!'));
      return await calculateArea(rl);
    }

    const area = width * height;
    console.log(chalk.greenBright(`\nDien tich hinh chu nhat la: ${area}\n`));

    const answer = await askQuestion(rl, 'Ban co muon tinh tiep khong? (y/n): ');
    if (answer.toLowerCase() === 'y') {
      await calculateArea(rl); // Tiếp tục tính toán
    } else {
      console.log(chalk.magentaBright('\nTam biet! Hen gap lai!\n'));
      rl.close(); // Kết thúc chương trình
    }
  } catch (error) {
    console.error(chalk.red('Co loi xay ra:'), error);
    rl.close();
  }
};

const main = () => {
  console.log(chalk.bold.blue('\n=== Chuong Trinh Tinh Dien Tich Hinh Chu Nhat ===\n'));
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  calculateArea(rl);
};

main();
