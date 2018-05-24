-- MySQL dump 10.13  Distrib 5.7.18, for Linux (x86_64)
--
-- Host: localhost    Database: DSPRODUCTINVENTORY
-- ------------------------------------------------------
-- Server version	5.7.18-0ubuntu0.17.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `AGREEMENT`
--

DROP TABLE IF EXISTS `AGREEMENT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AGREEMENT` (
  `HJID` bigint(20) NOT NULL,
  `DTYPE` varchar(31) DEFAULT NULL,
  `HERF` varchar(255) DEFAULT NULL,
  `ID` varchar(255) DEFAULT NULL,
  `AGREEMENT_PRODUCT_ID` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`HJID`),
  KEY `FK_AGREEMENT_AGREEMENT_PRODUCT_ID` (`AGREEMENT_PRODUCT_ID`),
  CONSTRAINT `FK_AGREEMENT_AGREEMENT_PRODUCT_ID` FOREIGN KEY (`AGREEMENT_PRODUCT_ID`) REFERENCES `PRODUCT` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AGREEMENT`
--

LOCK TABLES `AGREEMENT` WRITE;
/*!40000 ALTER TABLE `AGREEMENT` DISABLE KEYS */;
/*!40000 ALTER TABLE `AGREEMENT` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `BILLING_ACCOUNT`
--

DROP TABLE IF EXISTS `BILLING_ACCOUNT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `BILLING_ACCOUNT` (
  `HJID` bigint(20) NOT NULL,
  `DTYPE` varchar(31) DEFAULT NULL,
  `HREF` varchar(255) DEFAULT NULL,
  `ID` varchar(255) DEFAULT NULL,
  `NAME_` varchar(255) DEFAULT NULL,
  `BILLING_ACCOUNT_PRODUCT_ID` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`HJID`),
  KEY `FK_BILLING_ACCOUNT_BILLING_ACCOUNT_PRODUCT_ID` (`BILLING_ACCOUNT_PRODUCT_ID`),
  CONSTRAINT `FK_BILLING_ACCOUNT_BILLING_ACCOUNT_PRODUCT_ID` FOREIGN KEY (`BILLING_ACCOUNT_PRODUCT_ID`) REFERENCES `PRODUCT` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BILLING_ACCOUNT`
--

LOCK TABLES `BILLING_ACCOUNT` WRITE;
/*!40000 ALTER TABLE `BILLING_ACCOUNT` DISABLE KEYS */;
/*!40000 ALTER TABLE `BILLING_ACCOUNT` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `EVENTBAG`
--

DROP TABLE IF EXISTS `EVENTBAG`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `EVENTBAG` (
  `ID` varchar(255) NOT NULL,
  `DATEEVENT` datetime DEFAULT NULL,
  `EVENT` longblob,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `EVENTBAG`
--

LOCK TABLES `EVENTBAG` WRITE;
/*!40000 ALTER TABLE `EVENTBAG` DISABLE KEYS */;
/*!40000 ALTER TABLE `EVENTBAG` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Event_Product`
--

DROP TABLE IF EXISTS `Event_Product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Event_Product` (
  `ID` varchar(255) NOT NULL,
  `EVENTTIME` datetime DEFAULT NULL,
  `EVENTTYPE` varchar(255) DEFAULT NULL,
  `RESOURCE_ID` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_Event_Product_RESOURCE_ID` (`RESOURCE_ID`),
  CONSTRAINT `FK_Event_Product_RESOURCE_ID` FOREIGN KEY (`RESOURCE_ID`) REFERENCES `PRODUCT` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Event_Product`
--

LOCK TABLES `Event_Product` WRITE;
/*!40000 ALTER TABLE `Event_Product` DISABLE KEYS */;
/*!40000 ALTER TABLE `Event_Product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `HUB`
--

DROP TABLE IF EXISTS `HUB`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `HUB` (
  `ID` varchar(255) NOT NULL,
  `CALLBACK` varchar(255) DEFAULT NULL,
  `DATETIME` date DEFAULT NULL,
  `LEASESECONDS` int(11) DEFAULT NULL,
  `QUERY` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `HUB`
--

LOCK TABLES `HUB` WRITE;
/*!40000 ALTER TABLE `HUB` DISABLE KEYS */;
/*!40000 ALTER TABLE `HUB` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PRICE`
--

DROP TABLE IF EXISTS `PRICE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PRICE` (
  `HJID` bigint(20) NOT NULL,
  `DTYPE` varchar(31) DEFAULT NULL,
  `AMOUNT` float DEFAULT NULL,
  `CURRENCY` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`HJID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PRICE`
--

LOCK TABLES `PRICE` WRITE;
/*!40000 ALTER TABLE `PRICE` DISABLE KEYS */;
/*!40000 ALTER TABLE `PRICE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PRODUCT`
--

DROP TABLE IF EXISTS `PRODUCT`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PRODUCT` (
  `ID` bigint(20) NOT NULL,
  `DTYPE` varchar(31) DEFAULT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `HREF` varchar(255) DEFAULT NULL,
  `IS_BUNDLE` varchar(255) DEFAULT NULL,
  `IS_CUSTOMER_VISIBLE` varchar(255) DEFAULT NULL,
  `NAME_` varchar(255) DEFAULT NULL,
  `ORDER_DATE` datetime DEFAULT NULL,
  `PLACE` varchar(255) DEFAULT NULL,
  `PRODUCT_SERIAL_NUMBER` varchar(255) DEFAULT NULL,
  `START_DATE` datetime DEFAULT NULL,
  `STATUS` varchar(255) DEFAULT NULL,
  `TERMINATION_DATE` datetime DEFAULT NULL,
  `PRODUCT_OFFERING_PRODUCT_HJID` bigint(20) DEFAULT NULL,
  `PRODUCT_SPECIFICATION_PRODUC_0` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_PRODUCT_PRODUCT_SPECIFICATION_PRODUC_0` (`PRODUCT_SPECIFICATION_PRODUC_0`),
  KEY `FK_PRODUCT_PRODUCT_OFFERING_PRODUCT_HJID` (`PRODUCT_OFFERING_PRODUCT_HJID`),
  CONSTRAINT `FK_PRODUCT_PRODUCT_OFFERING_PRODUCT_HJID` FOREIGN KEY (`PRODUCT_OFFERING_PRODUCT_HJID`) REFERENCES `PRODUCT_OFFERING` (`HJID`),
  CONSTRAINT `FK_PRODUCT_PRODUCT_SPECIFICATION_PRODUC_0` FOREIGN KEY (`PRODUCT_SPECIFICATION_PRODUC_0`) REFERENCES `PRODUCT_SPECIFICATION` (`HJID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PRODUCT`
--

LOCK TABLES `PRODUCT` WRITE;
/*!40000 ALTER TABLE `PRODUCT` DISABLE KEYS */;
/*!40000 ALTER TABLE `PRODUCT` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PRODUCT_CHARACTERISTIC`
--

DROP TABLE IF EXISTS `PRODUCT_CHARACTERISTIC`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PRODUCT_CHARACTERISTIC` (
  `HJID` bigint(20) NOT NULL,
  `DTYPE` varchar(31) DEFAULT NULL,
  `NAME_` varchar(255) DEFAULT NULL,
  `VALUE_` varchar(255) DEFAULT NULL,
  `PRODUCT_CHARACTERISTIC_PRODU_0` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`HJID`),
  KEY `PRODUCTCHARACTERISTICPRODUCTCHARACTERISTIC_PRODU_0` (`PRODUCT_CHARACTERISTIC_PRODU_0`),
  CONSTRAINT `PRODUCTCHARACTERISTICPRODUCTCHARACTERISTIC_PRODU_0` FOREIGN KEY (`PRODUCT_CHARACTERISTIC_PRODU_0`) REFERENCES `PRODUCT` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PRODUCT_CHARACTERISTIC`
--

LOCK TABLES `PRODUCT_CHARACTERISTIC` WRITE;
/*!40000 ALTER TABLE `PRODUCT_CHARACTERISTIC` DISABLE KEYS */;
/*!40000 ALTER TABLE `PRODUCT_CHARACTERISTIC` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PRODUCT_OFFERING`
--

DROP TABLE IF EXISTS `PRODUCT_OFFERING`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PRODUCT_OFFERING` (
  `HJID` bigint(20) NOT NULL,
  `DTYPE` varchar(31) DEFAULT NULL,
  `HREF` varchar(255) DEFAULT NULL,
  `ID` varchar(255) DEFAULT NULL,
  `NAME_` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`HJID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PRODUCT_OFFERING`
--

LOCK TABLES `PRODUCT_OFFERING` WRITE;
/*!40000 ALTER TABLE `PRODUCT_OFFERING` DISABLE KEYS */;
/*!40000 ALTER TABLE `PRODUCT_OFFERING` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PRODUCT_PRICE`
--

DROP TABLE IF EXISTS `PRODUCT_PRICE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PRODUCT_PRICE` (
  `HJID` bigint(20) NOT NULL,
  `DTYPE` varchar(31) DEFAULT NULL,
  `DESCRIPTION` varchar(255) DEFAULT NULL,
  `NAME_` varchar(255) DEFAULT NULL,
  `PRICE_TYPE` varchar(255) DEFAULT NULL,
  `RECURRING_CHARGE_PERIOD` varchar(255) DEFAULT NULL,
  `UNIT_OF_MEASURE` varchar(255) DEFAULT NULL,
  `PRICE_PRODUCT_PRICE_HJID` bigint(20) DEFAULT NULL,
  `VALID_FOR_PRODUCT_PRICE_HJID` bigint(20) DEFAULT NULL,
  `PRODUCT_PRICE_PRODUCT_ID` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`HJID`),
  KEY `FK_PRODUCT_PRICE_VALID_FOR_PRODUCT_PRICE_HJID` (`VALID_FOR_PRODUCT_PRICE_HJID`),
  KEY `FK_PRODUCT_PRICE_PRICE_PRODUCT_PRICE_HJID` (`PRICE_PRODUCT_PRICE_HJID`),
  KEY `FK_PRODUCT_PRICE_PRODUCT_PRICE_PRODUCT_ID` (`PRODUCT_PRICE_PRODUCT_ID`),
  CONSTRAINT `FK_PRODUCT_PRICE_PRICE_PRODUCT_PRICE_HJID` FOREIGN KEY (`PRICE_PRODUCT_PRICE_HJID`) REFERENCES `PRICE` (`HJID`),
  CONSTRAINT `FK_PRODUCT_PRICE_PRODUCT_PRICE_PRODUCT_ID` FOREIGN KEY (`PRODUCT_PRICE_PRODUCT_ID`) REFERENCES `PRODUCT` (`ID`),
  CONSTRAINT `FK_PRODUCT_PRICE_VALID_FOR_PRODUCT_PRICE_HJID` FOREIGN KEY (`VALID_FOR_PRODUCT_PRICE_HJID`) REFERENCES `VALID_FOR` (`HJID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PRODUCT_PRICE`
--

LOCK TABLES `PRODUCT_PRICE` WRITE;
/*!40000 ALTER TABLE `PRODUCT_PRICE` DISABLE KEYS */;
/*!40000 ALTER TABLE `PRODUCT_PRICE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PRODUCT_REF`
--

DROP TABLE IF EXISTS `PRODUCT_REF`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PRODUCT_REF` (
  `HJID` bigint(20) NOT NULL,
  `DTYPE` varchar(31) DEFAULT NULL,
  `HREF` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`HJID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PRODUCT_REF`
--

LOCK TABLES `PRODUCT_REF` WRITE;
/*!40000 ALTER TABLE `PRODUCT_REF` DISABLE KEYS */;
/*!40000 ALTER TABLE `PRODUCT_REF` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PRODUCT_RELATIONSHIP`
--

DROP TABLE IF EXISTS `PRODUCT_RELATIONSHIP`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PRODUCT_RELATIONSHIP` (
  `HJID` bigint(20) NOT NULL,
  `DTYPE` varchar(31) DEFAULT NULL,
  `TYPE_` varchar(255) DEFAULT NULL,
  `PRODUCT_PRODUCT_RELATIONSHIP_0` bigint(20) DEFAULT NULL,
  `PRODUCT_RELATIONSHIP_PRODUCT_0` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`HJID`),
  KEY `PRODUCT_RELATIONSHIPPRODUCT_PRODUCT_RELATIONSHIP_0` (`PRODUCT_PRODUCT_RELATIONSHIP_0`),
  KEY `PRODUCT_RELATIONSHIPPRODUCT_RELATIONSHIP_PRODUCT_0` (`PRODUCT_RELATIONSHIP_PRODUCT_0`),
  CONSTRAINT `PRODUCT_RELATIONSHIPPRODUCT_PRODUCT_RELATIONSHIP_0` FOREIGN KEY (`PRODUCT_PRODUCT_RELATIONSHIP_0`) REFERENCES `PRODUCT_REF` (`HJID`),
  CONSTRAINT `PRODUCT_RELATIONSHIPPRODUCT_RELATIONSHIP_PRODUCT_0` FOREIGN KEY (`PRODUCT_RELATIONSHIP_PRODUCT_0`) REFERENCES `PRODUCT` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PRODUCT_RELATIONSHIP`
--

LOCK TABLES `PRODUCT_RELATIONSHIP` WRITE;
/*!40000 ALTER TABLE `PRODUCT_RELATIONSHIP` DISABLE KEYS */;
/*!40000 ALTER TABLE `PRODUCT_RELATIONSHIP` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PRODUCT_SPECIFICATION`
--

DROP TABLE IF EXISTS `PRODUCT_SPECIFICATION`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `PRODUCT_SPECIFICATION` (
  `HJID` bigint(20) NOT NULL,
  `DTYPE` varchar(31) DEFAULT NULL,
  `HREF` varchar(255) DEFAULT NULL,
  `ID` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`HJID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PRODUCT_SPECIFICATION`
--

LOCK TABLES `PRODUCT_SPECIFICATION` WRITE;
/*!40000 ALTER TABLE `PRODUCT_SPECIFICATION` DISABLE KEYS */;
/*!40000 ALTER TABLE `PRODUCT_SPECIFICATION` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `REALIZING_RESOURCE`
--

DROP TABLE IF EXISTS `REALIZING_RESOURCE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `REALIZING_RESOURCE` (
  `HJID` bigint(20) NOT NULL,
  `DTYPE` varchar(31) DEFAULT NULL,
  `HREF` varchar(255) DEFAULT NULL,
  `ID` varchar(255) DEFAULT NULL,
  `REALIZING_RESOURCE_PRODUCT_ID` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`HJID`),
  KEY `REALIZING_RESOURCE_REALIZING_RESOURCE_PRODUCT_ID` (`REALIZING_RESOURCE_PRODUCT_ID`),
  CONSTRAINT `REALIZING_RESOURCE_REALIZING_RESOURCE_PRODUCT_ID` FOREIGN KEY (`REALIZING_RESOURCE_PRODUCT_ID`) REFERENCES `PRODUCT` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `REALIZING_RESOURCE`
--

LOCK TABLES `REALIZING_RESOURCE` WRITE;
/*!40000 ALTER TABLE `REALIZING_RESOURCE` DISABLE KEYS */;
/*!40000 ALTER TABLE `REALIZING_RESOURCE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `REALIZING_SERVICE`
--

DROP TABLE IF EXISTS `REALIZING_SERVICE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `REALIZING_SERVICE` (
  `HJID` bigint(20) NOT NULL,
  `DTYPE` varchar(31) DEFAULT NULL,
  `HREF` varchar(255) DEFAULT NULL,
  `ID` varchar(255) DEFAULT NULL,
  `REALIZING_SERVICE_PRODUCT_ID` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`HJID`),
  KEY `FK_REALIZING_SERVICE_REALIZING_SERVICE_PRODUCT_ID` (`REALIZING_SERVICE_PRODUCT_ID`),
  CONSTRAINT `FK_REALIZING_SERVICE_REALIZING_SERVICE_PRODUCT_ID` FOREIGN KEY (`REALIZING_SERVICE_PRODUCT_ID`) REFERENCES `PRODUCT` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `REALIZING_SERVICE`
--

LOCK TABLES `REALIZING_SERVICE` WRITE;
/*!40000 ALTER TABLE `REALIZING_SERVICE` DISABLE KEYS */;
/*!40000 ALTER TABLE `REALIZING_SERVICE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RELATED_PARTY`
--

DROP TABLE IF EXISTS `RELATED_PARTY`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `RELATED_PARTY` (
  `HJID` bigint(20) NOT NULL,
  `DTYPE` varchar(31) DEFAULT NULL,
  `HREF` varchar(255) DEFAULT NULL,
  `ID` varchar(255) DEFAULT NULL,
  `ROLE_` varchar(255) DEFAULT NULL,
  `RELATED_PARTY_PRODUCT_ID` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`HJID`),
  KEY `FK_RELATED_PARTY_RELATED_PARTY_PRODUCT_ID` (`RELATED_PARTY_PRODUCT_ID`),
  CONSTRAINT `FK_RELATED_PARTY_RELATED_PARTY_PRODUCT_ID` FOREIGN KEY (`RELATED_PARTY_PRODUCT_ID`) REFERENCES `PRODUCT` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RELATED_PARTY`
--

LOCK TABLES `RELATED_PARTY` WRITE;
/*!40000 ALTER TABLE `RELATED_PARTY` DISABLE KEYS */;
/*!40000 ALTER TABLE `RELATED_PARTY` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SEQUENCE`
--

DROP TABLE IF EXISTS `SEQUENCE`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `SEQUENCE` (
  `SEQ_NAME` varchar(50) NOT NULL,
  `SEQ_COUNT` decimal(38,0) DEFAULT NULL,
  PRIMARY KEY (`SEQ_NAME`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SEQUENCE`
--

LOCK TABLES `SEQUENCE` WRITE;
/*!40000 ALTER TABLE `SEQUENCE` DISABLE KEYS */;
INSERT INTO `SEQUENCE` VALUES ('SEQ_GEN',0);
/*!40000 ALTER TABLE `SEQUENCE` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `VALID_FOR`
--

DROP TABLE IF EXISTS `VALID_FOR`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `VALID_FOR` (
  `HJID` bigint(20) NOT NULL,
  `DTYPE` varchar(31) DEFAULT NULL,
  `END_DATE_TIME` datetime DEFAULT NULL,
  `START_DATE_TIME` datetime DEFAULT NULL,
  PRIMARY KEY (`HJID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `VALID_FOR`
--

LOCK TABLES `VALID_FOR` WRITE;
/*!40000 ALTER TABLE `VALID_FOR` DISABLE KEYS */;
/*!40000 ALTER TABLE `VALID_FOR` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-06-05 11:48:42