-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2019 年 05 月 21 日 19:34
-- 伺服器版本： 10.1.38-MariaDB
-- PHP 版本： 7.3.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `youtube`
--
CREATE DATABASE IF NOT EXISTS `youtube` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `youtube`;

-- --------------------------------------------------------

--
-- 資料表結構 `songs`
--

CREATE TABLE `songs` (
  `id` char(11) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'YouTube ID',
  `singer` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '歌手名稱',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '影片名稱',
  `img` char(48) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '縮圖連結',
  `link` varchar(43) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '影片連結',
  `pageview` bigint(20) NOT NULL DEFAULT '0' COMMENT '觀看次數',
  `downloaded_at` datetime DEFAULT NULL COMMENT '影音下載時間',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '新增時間',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='影音';

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `songs`
--
ALTER TABLE `songs`
  ADD PRIMARY KEY (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
