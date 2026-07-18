Introduction 视频资源目录

建议文件：
- introduction.mp4       1920×1080，H.264，16:9
- introduction-poster.jpg

放入视频后，打开 scripts/config.js，将：

  src: ''

修改为：

  src: 'assets/video/introduction.mp4'

如有封面，同时将 poster 设置为：

  poster: 'assets/video/introduction-poster.jpg'

网页会自动隐藏占位画面并显示视频。
