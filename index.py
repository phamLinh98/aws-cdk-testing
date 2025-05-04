# Phan mem tinh dien tich tam giac

def main():
    print("Chương trình tính diện tích tam giác")
    print("Nhập chiều cao và đáy của tam giác")
    
    try:
        height = float(input("Chiều cao: "))
        base = float(input("Đáy: "))
        
        if height <= 0 or base <= 0:
            raise ValueError("Chiều cao và đáy phải lớn hơn 0.")
        
        area = (base * height) / 2
        print(f"Diện tích tam giác là: {area}")
    except ValueError as e:
        print(f"Lỗi: {e}")