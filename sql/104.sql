-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2019 年 07 月 20 日 20:26
-- 伺服器版本： 10.3.16-MariaDB
-- PHP 版本： 7.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `104`
--
CREATE DATABASE IF NOT EXISTS `104` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `104`;

-- --------------------------------------------------------

--
-- 資料表結構 `jobs`
--

CREATE TABLE `jobs` (
  `sn` int(11) NOT NULL COMMENT '流水號',
  `keyword` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '關鍵字',
  `position` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '職稱',
  `positionLink` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '職稱連結',
  `location` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '地點',
  `companyName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '公司名稱',
  `companyLink` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '公司連結',
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '種類',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '新增時間',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工作職缺';

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`sn`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `jobs`
--
ALTER TABLE `jobs`
  MODIFY `sn` int(11) NOT NULL AUTO_INCREMENT COMMENT '流水號';
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
