import tkinter as tk

class App:
    def __init__(self, root):
        self.root = root
        self.root.title("输入示例")
        self.root.geometry("400x300")
        
        # 初始状态显示按钮
        self.show_button()
    
    def show_button(self):
        self.btn = tk.Button(self.root, text="点击输入", command=self.show_input_frame)
        self.btn.pack(pady=20)
        
        # 显示提示标签
        self.label = tk.Label(self.root, text="等待输入...")
        self.label.pack(pady=20)
    
    def show_input_frame(self):
        # 隐藏按钮
        self.btn.pack_forget()
        
        # 创建输入框架
        self.input_frame = tk.Frame(self.root)
        self.input_frame.pack(pady=20)
        
        tk.Label(self.input_frame, text="请输入：").pack()
        self.entry = tk.Entry(self.input_frame, width=30)
        self.entry.pack(pady=5)
        self.entry.focus()
        
        # 按钮框架
        btn_frame = tk.Frame(self.input_frame)
        btn_frame.pack(pady=10)
        
        tk.Button(btn_frame, text="确定", command=self.on_confirm).pack(side=tk.LEFT, padx=5)
        tk.Button(btn_frame, text="取消", command=self.on_cancel).pack(side=tk.LEFT, padx=5)
        
        # 绑定回车键
        self.entry.bind('<Return>', lambda e: self.on_confirm())
    
    def on_confirm(self):
        result = self.entry.get()
        self.label.config(text=f"你输入的是：{result}")
        self.close_input_frame()
    
    def on_cancel(self):
        self.label.config(text="已取消输入")
        self.close_input_frame()
    
    def close_input_frame(self):
        # 销毁输入框架
        self.input_frame.destroy()
        # 重新显示按钮
        self.btn.pack(pady=20)

if __name__ == "__main__":
    root = tk.Tk()
    app = App(root)
    root.mainloop()