-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- 主機： 127.0.0.1
-- 產生時間： 2019 年 07 月 07 日 21:22
-- 伺服器版本： 10.3.15-MariaDB
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
-- 資料庫： `wiki`
--
CREATE DATABASE IF NOT EXISTS `wiki` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `wiki`;

-- --------------------------------------------------------

--
-- 資料表結構 `threekingdoms`
--

CREATE TABLE `threekingdoms` (
  `sn` int(11) NOT NULL COMMENT '流水號',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '姓名',
  `link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '維基百科連結',
  `alias` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '字',
  `birthplace` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '籍貫',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '列傳',
  `beginEpisode` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '首回',
  `endEpisode` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '末回',
  `identity` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '史構',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '新增時間',
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='維基百科「三國演義角色列表」';

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `threekingdoms`
--
ALTER TABLE `threekingdoms`
  ADD PRIMARY KEY (`sn`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `threekingdoms`
--
ALTER TABLE `threekingdoms`
  MODIFY `sn` int(11) NOT NULL AUTO_INCREMENT COMMENT '流水號';
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
